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
                    reasoning: "Univerzální dárek, který potěší každého, kdo má rád kulturu a zážitky."
                },
                {
                    title: "Dárková karta",
                    description: "Karta do oblíbeného obchodu (Alza, IKEA, Luxor).",
                    estimatedPrice: 1000,
                    reasoning: "Nejjistější volba, když seznam zatím zeje prázdnotou."
                }
            ];
        }

        const titles = wishes.map(w => w.title.toLowerCase());
        const pool: AITip[] = [];

        // 1. Tip založený na náhodném dárku ze seznamu pro dynamiku
        const randomWish = wishes[Math.floor(Math.random() * wishes.length)];
        pool.push({
            title: `Příslušenství k: ${randomWish.title}`,
            description: `Kvalitní doplněk nebo související drobnost, která vylepší zážitek z ${randomWish.title.toLowerCase()}.`,
            estimatedPrice: randomWish.price ? Math.round(randomWish.price * 0.25) : 400,
            reasoning: `Tento tip jsme vygenerovali na základě tvého přání "${randomWish.title}".`
        });

        // 2. Tématické dárky podle klíčových slov
        if (titles.some(t => t.includes('maska') || t.includes('kosmetika') || t.includes('péče') || t.includes('vlasy'))) {
            pool.push({
                title: "Sada relaxačních olejů",
                description: "Výběr esenciálních olejů pro domácí wellness a relaxaci.",
                estimatedPrice: 450,
                reasoning: "Skvěle doplňuje tvůj zájem o péči o sebe."
            });
            pool.push({
                title: "Hedvábný povlak na polštář",
                description: "Luxusní doplněk pro lepší spánek a zdravější pleť.",
                estimatedPrice: 800,
                reasoning: "Praktický a přitom luxusní kousek pro tvůj rituál."
            });
        }

        if (titles.some(t => t.includes('povlečení') || t.includes('kuchyň') || t.includes('byt') || t.includes('domov'))) {
            pool.push({
                title: "Vlněný pléd nebo deka",
                description: "Hřejivý a stylový doplněk pro zútulnění domova.",
                estimatedPrice: 1200,
                reasoning: "Hodí se k tvému zájmu o doplňky do bytu."
            });
            pool.push({
                title: "Aromatický difuzér",
                description: "Designový kousek, který provoní tvůj domov.",
                estimatedPrice: 650,
                reasoning: "Další způsob, jak si doma vytvořit příjemnou atmosféru."
            });
        }

        if (titles.some(t => t.includes('nářadí') || t.includes('kutil') || t.includes('oprava') || t.includes('technika'))) {
            pool.push({
                title: "Magnetický náramek na šroubky",
                description: "Praktický pomocník pro každého kutila při práci.",
                estimatedPrice: 350,
                reasoning: "Šikovná vychytávka k tvému nářadí."
            });
            pool.push({
                title: "Kvalitní čelovka",
                description: "Výkonná LED svítilna pro práci i volný čas.",
                estimatedPrice: 500,
                reasoning: "Nezbytnost pro každého, kdo rád tvoří nebo kutí."
            });
        }

        // 3. Záložní univerzální tipy (pouze pokud je pool malý)
        if (pool.length < 3) {
            pool.push({
                title: "Degustační set výběrové kávy",
                description: "Výběr nejlepších kávových zrn v dárkovém balení.",
                estimatedPrice: 400,
                reasoning: "Univerzální prémiový dárek pro každou příležitost."
            });
            pool.push({
                title: "Předplatné oblíbené služby",
                description: "Dárkový kupon na Netflix, Spotify nebo třeba Audible.",
                estimatedPrice: 300,
                reasoning: "Zábava, která se hodí ke každému stylu života."
            });
            pool.push({
                title: "Láhev kvalitního vína",
                description: "Výběr z menšího vinařství od someliéra.",
                estimatedPrice: 450,
                reasoning: "Klasický dárek, který v dobré kvalitě vždy potěší."
            });
        }

        // Zamíchat a vzít 3 náhodné pro pocit pestrosti
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
      Jsi expert na dárky a pomáháš vybrat skvělý dárek na základě seznamu přání.
      
      SEZNAM PŘÁNÍ (tyto věci oslavenec CHCE):
      ${wishList || 'Seznam je zatím prázdný.'}

      UŽ VLASTNĚNÉ VĚCI (inspirace):
      ${ownedList || 'Zatím žádné.'}

      ${occasion ? `Příležitost: ${occasion}` : ''}

      Úkol:
      Navrhni 3 originální dárky (nenavrhuj věci ze seznamu výše).
      Odpověď vrať VÝHRADNĚ ve formátu JSON:
      {
        "tips": [
          {
            "title": "název",
            "description": "popis",
            "estimatedPrice": 123,
            "reasoning": "argument proč"
          }
        ]
      }
    `;

        // Trying various model/version combinations to find one that works
        const modelsToTry = [
            { name: 'gemini-1.5-flash', version: 'v1beta' },
            { name: 'gemini-1.5-flash', version: 'v1' },
            { name: 'gemini-2.0-flash-exp', version: 'v1beta' },
            { name: 'gemini-1.5-pro', version: 'v1beta' }
        ];

        let lastError: any = null;

        for (const modelCfg of modelsToTry) {
            try {
                const model = this.genAI!.getGenerativeModel(
                    { model: modelCfg.name },
                    { apiVersion: modelCfg.version as any }
                );

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                if (!text) continue;

                // Clean potential markdown code blocks
                const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const data = JSON.parse(jsonStr);
                return data.tips || data;
            } catch (error: any) {
                lastError = error;
                console.warn(`Model ${modelCfg.name} (${modelCfg.version}) failed:`, error.message);

                if (error.message?.includes('429')) {
                    break; // Quota issues, stop trying
                }
            }
        }

        console.error('AI Service exhausted all models. Using smart fallback.', lastError);
        return this.getFallbackTips(wishes);
    }
}

export const aiService = AIService;
