import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Gift } from '@/types'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

export interface AITip {
    title: string
    description: string
    estimatedPrice?: number
    reasoning: string
}

export class AIService {
    private static genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

    private static getFallbackTips(wishes: Gift[]): AITip[] {
        if (wishes.length === 0) {
            return [
                {
                    title: "Zážitkový poukaz na míru",
                    description: "Vstupenky na akci podle tvých zájmů (kino, koncert, degustace).",
                    estimatedPrice: 1500,
                    reasoning: "Univerzální, ale přizpůsobitelný dárek, který v začátcích seznamu vždy potěší."
                },
                {
                    title: "Dárková karta do oblíbeného obchodu",
                    description: "Karta do obchodu, kde si vybereš přesně to, co ti v seznamu chybí.",
                    estimatedPrice: 1000,
                    reasoning: "Nejjistější volba pro první inspiraci."
                }
            ];
        }

        const titles = wishes.map(w => w.title.toLowerCase());
        const pool: AITip[] = [];

        // 1. Specifické doporučení podle nejvýraznějších položek
        const firstGift = wishes[0];
        pool.push({
            title: `Doplněk k: ${firstGift.title}`,
            description: `Něco, co skvěle doplňuje tvé přání "${firstGift.title}".`,
            estimatedPrice: firstGift.price ? Math.round(firstGift.price * 0.35) : 450,
            reasoning: `Tento tip jsme vybrali, protože v seznamu už máš "${firstGift.title}".`
        });

        // 2. Tématická logika podle klíčových slov
        if (titles.some(t => t.includes('maska') || t.includes('vlasy') || t.includes('péče'))) {
            pool.push({
                title: "Sada relaxačních olejů",
                description: "Balíček pro domácí wellness a hloubkovou relaxaci.",
                estimatedPrice: 650,
                reasoning: "Skvěle doplňuje tvou péči o sebe a relaxační rituály."
            });
        }

        if (titles.some(t => t.includes('nářadí') || t.includes('kutil') || t.includes('dílna'))) {
            pool.push({
                title: "Magnetický náramek na součástky",
                description: "Praktická vychytávka, která ti při práci ušetří čas.",
                estimatedPrice: 350,
                reasoning: "Šikovný pomocník pro tvé kutilské projekty."
            });
        }

        if (titles.some(t => t.includes('povlečení') || t.includes('byt') || t.includes('domov'))) {
            pool.push({
                title: "Designový doplňek do bytu",
                description: "Stylový kousek, který vylepší atmosféru tvého domova.",
                estimatedPrice: 500,
                reasoning: "Víme, že ti záleží na pohodlí a stylu tvého domova."
            });
        }

        // 3. Univerzální, ale kvalitní "fallbacky"
        pool.push({
            title: "Předplatné na audio knihy nebo hudbu",
            description: "Dárkový kupon pro nekonečnou zábavu.",
            estimatedPrice: 500,
            reasoning: "Zábava, která se hodí ke každému stylu života."
        });

        pool.push({
            title: "Kurz nebo workshop podle tvého gusta",
            description: "Poukaz na lekci něčeho, co tě baví (vaření, malování, sport).",
            estimatedPrice: 1200,
            reasoning: "Zážitek a nové dovednosti jsou často nejlepším dárkem."
        });

        // Zamíchat a vzít 3 náhodné
        return pool.sort(() => 0.5 - Math.random()).slice(0, 3);
    }

    static async analyzeGiftsAndGetTips(wishes: Gift[], ownedGifts: Gift[], occasion?: string): Promise<AITip[]> {
        if (!API_KEY) {
            return this.getFallbackTips(wishes);
        }

        const wishList = wishes
            .map((g) => `- ${g.title}${g.description ? `: ${g.description}` : ''}${g.price ? ` (${g.price} ${g.currency})` : ''}`)
            .join('\n');

        const ownedList = ownedGifts
            .map((g) => `- ${g.title}${g.description ? `: ${g.description}` : ''}`)
            .join('\n');

        const prompt = `
      Jsi expert na dárky. Na základě seznamu přání navrhni 3 originální dárky.
      
      OSLAVENEC CHCE:
      ${wishList || 'Seznam je prázdný.'}
      OSLAVENEC MÁ:
      ${ownedList || 'Žádné.'}
      ${occasion ? `Příležitost: ${occasion}` : ''}

      Důležité: Nenavrhuj věci ze seznamu ani generické dárky. 
      Odpověď vrať VÝHRADNĚ ve formátu JSON:
      {
        "tips": [
          {"title": "název", "description": "popis", "estimatedPrice": 123, "reasoning": "argument"}
        ]
      }
    `;

        // Updated model list to avoid 404s and 400s
        const modelsToTry = [
            { name: 'gemini-1.5-flash', version: 'v1' },
            { name: 'gemini-1.5-flash', version: 'v1beta' },
            { name: 'gemini-1.5-pro', version: 'v1' },
            { name: 'gemini-2.0-flash-exp', version: 'v1beta' },
            { name: 'gemini-pro', version: 'v1' }
        ];

        let lastError: any = null;

        for (const modelCfg of modelsToTry) {
            try {
                const model = this.genAI!.getGenerativeModel(
                    {
                        model: modelCfg.name,
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 1024,
                            // removed responseMimeType to avoid 400 error on some models
                        }
                    },
                    { apiVersion: modelCfg.version as any }
                );

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                if (!text) continue;

                // Robust JSON parsing (handles markdown blocks)
                const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const data = JSON.parse(jsonStr);
                return data.tips || data;
            } catch (error: any) {
                lastError = error;
                console.warn(`Model ${modelCfg.name} (${modelCfg.version}) failed:`, error.message);

                if (error.message?.includes('429')) {
                    break;
                }
            }
        }

        console.error('AI Service exhausted all models. Using smart fallback.', lastError);
        return this.getFallbackTips(wishes);
    }
}

export const aiService = AIService;
