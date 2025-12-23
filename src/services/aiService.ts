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
                    title: "Zážitkový poukaz",
                    description: "Vstupenky do divadla, na koncert nebo degustační večeři.",
                    estimatedPrice: 1500,
                    reasoning: "Univerzální dárek, který v začátcích seznamu vždy potěší."
                },
                {
                    title: "Dárková karta",
                    description: "Karta do oblíbeného obchodu (Alza, IKEA, Luxor).",
                    estimatedPrice: 1000,
                    reasoning: "Nejjistější volba pro první inspiraci."
                }
            ];
        }

        const titles = wishes.map(w => w.title.toLowerCase());
        const pool: AITip[] = [];

        // 1. Dynamický tip založený na existujících přáních
        wishes.slice(0, 2).forEach(wish => {
            pool.push({
                title: `Prémiová verze nebo doplněk k: ${wish.title}`,
                description: `Něco, co posune tvůj zážitek z ${wish.title.toLowerCase()} na další úroveň.`,
                estimatedPrice: wish.price ? Math.round(wish.price * 0.4) : 500,
                reasoning: `Tento tip jsme vybrali přímo podle tvého přání v seznamu.`
            });
        });

        // 2. Tématické dárky podle klíčových slov
        const hasMatch = {
            beauty: titles.some(t => t.includes('maska') || t.includes('kosmetika') || t.includes('péče') || t.includes('vlasy')),
            home: titles.some(t => t.includes('povlečení') || t.includes('kuchyň') || t.includes('byt') || t.includes('domov')),
            tool: titles.some(t => t.includes('nářadí') || t.includes('kutil') || t.includes('oprava') || t.includes('dílna')),
            tech: titles.some(t => t.includes('mobil') || t.includes('pc') || t.includes('elektro') || t.includes('sluchátka'))
        };

        if (hasMatch.beauty) {
            pool.push({
                title: "Luxusní vonná svíčka",
                description: "Svíčka s dřevěným knotem pro dokonalou relaxaci u koupele.",
                estimatedPrice: 550,
                reasoning: "Skvěle doplňuje tvůj zájem o wellness a péči."
            });
            pool.push({
                title: "Kosmetická taštička s monogramem",
                description: "Stylový a osobní doplněk na tvé oblíbené produkty.",
                estimatedPrice: 400,
                reasoning: "Praktická drobnost pro někoho, kdo má rád svou kosmetiku."
            });
        }

        if (hasMatch.home) {
            pool.push({
                title: "Designový doplňek na noční stolek",
                description: "Stylová lampička nebo podtácek, který zútulní tvou ložnici.",
                estimatedPrice: 750,
                reasoning: "Hodí se k tvému zájmu o doplňky do domácnosti."
            });
            pool.push({
                title: "Kvalitní difuzér s esenciálními oleji",
                description: "Pro provonění domova a lepší spánek.",
                estimatedPrice: 900,
                reasoning: "Doplňuje tvůj zájem o věci jako povlečení a pohodlí domova."
            });
        }

        if (hasMatch.tool) {
            pool.push({
                title: "Víceúčelový nůž (Multitool)",
                description: "Kvalitní nástroj, který nahradí celou brašnu s nářadím.",
                estimatedPrice: 1200,
                reasoning: "Pro kutila jako ty je to povinná výbava."
            });
            pool.push({
                title: "Magnetický držák na nářadí",
                description: "Lišta do dílny, díky které budeš mít v nářadí konečně systém.",
                estimatedPrice: 350,
                reasoning: "Praktické rozšíření tvé dílny."
            });
        }

        if (hasMatch.tech) {
            pool.push({
                title: "Powerbanka s rychlonabíjením",
                description: "Kompaktní zdroj energie na cesty.",
                estimatedPrice: 800,
                reasoning: "Abys měl svou elektroniku vždy nabitou."
            });
        }

        // 3. Záložní tipy pro doplnění do 3
        if (pool.length < 3) {
            pool.push({
                title: "Degustační set výběrové kávy",
                description: "Výběr nejlepších kávových zrn pro gurmány.",
                estimatedPrice: 450,
                reasoning: "Univerzální prémiový dárek pro chvíle pohody."
            });
            pool.push({
                title: "Láhev archivního vína",
                description: "Výběr z menšího vinařství od someliéra.",
                estimatedPrice: 600,
                reasoning: "Když si chceš večer opravdu vychutnat."
            });
        }

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
      Jsi expert na dárky a pomáháš vybrat 3 dárky na základě seznamu přání.
      
      SEZNAM PŘÁNÍ (tyto věci chce):
      ${wishList || 'Seznam je prázdný.'}

      VLASTNĚNÉ VĚCI (inspirace):
      ${ownedList || 'Žádné.'}

      ${occasion ? `Příležitost: ${occasion}` : ''}

      Úkol:
      Navrhni 3 nové dárky (nenavrhuj ty ze seznamu).
      Odpověď vrať VÝHRADNĚ ve formátu JSON:
      {
        "tips": [
          {"title": "název", "description": "popis", "estimatedPrice": 123, "reasoning": "argument"}
        ]
      }
    `;

        // Updated model list with more specific variants to avoid 404
        const modelsToTry = [
            { name: 'gemini-1.5-flash-8b-latest', version: 'v1beta' },
            { name: 'gemini-1.5-flash-latest', version: 'v1beta' },
            { name: 'gemini-1.5-flash', version: 'v1' },
            { name: 'gemini-1.5-flash', version: 'v1beta' },
            { name: 'gemini-2.0-flash-exp', version: 'v1beta' }
        ];

        let lastError: any = null;

        for (const modelCfg of modelsToTry) {
            try {
                const model = this.genAI!.getGenerativeModel(
                    {
                        model: modelCfg.name,
                        // For older models, sometimes removing specific configs helps with 404/403
                        generationConfig: {
                            temperature: 0.7,
                            topP: 0.8,
                            topK: 40,
                            maxOutputTokens: 1024,
                            responseMimeType: "application/json"
                        }
                    },
                    { apiVersion: modelCfg.version as any }
                );

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                if (!text) continue;

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
