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

        const tips: AITip[] = [];
        const titles = wishes.map(w => w.title.toLowerCase());

        // 1. Tip založený na prvním dárku v seznamu
        const mainWish = wishes[0];
        tips.push({
            title: `Doplněk k: ${mainWish.title}`,
            description: `Kvalitní příslušenství nebo související drobnost, která vylepší zážitek z ${mainWish.title.toLowerCase()}.`,
            estimatedPrice: mainWish.price ? Math.round(mainWish.price * 0.3) : 500,
            reasoning: `Tento tip jsme vybrali, protože v seznamu máš ${mainWish.title.toLowerCase()}.`
        });

        // 2. Tématický tip
        const isBeauty = titles.some(t => t.includes('maska') || t.includes('kosmetika') || t.includes('péče'));
        const isHome = titles.some(t => t.includes('povlečení') || t.includes('kuchyň') || t.includes('byt'));
        const isTool = titles.some(t => t.includes('nářadí') || t.includes('kutil') || t.includes('oprava'));

        if (isBeauty) {
            tips.push({
                title: "Sada relaxačních olejů",
                description: "Balíček esenciálních olejů pro domácí wellness a relaxaci.",
                estimatedPrice: 450,
                reasoning: "Skvěle doplňuje tvůj zájem o péči o sebe a relaxační rituály."
            });
        } else if (isHome) {
            tips.push({
                title: "Designový doplňek do bytu",
                description: "Stylová dekorace, svíčka nebo drobnost, která zútulní domov.",
                estimatedPrice: 600,
                reasoning: "Víme, že rád/a vylepšuješ své okolí a domov."
            });
        } else if (isTool) {
            tips.push({
                title: "Magnetický náramek na šroubky",
                description: "Praktický pomocník pro každého kutila při práci v dílně.",
                estimatedPrice: 350,
                reasoning: "Praktická drobnost, která se hodí k tvému kutilskému vybavení."
            });
        } else {
            tips.push({
                title: "Degustační set káv nebo čajů",
                description: "Výběr nejlepších kávových zrn nebo sypaných čajů v dárkovém balení.",
                estimatedPrice: 400,
                reasoning: "Univerzální prémiový dárek pro chvíle klidu a pohody."
            });
        }

        // 3. Univerzální doplňující tip
        tips.push({
            title: "Předplatné oblíbené služby",
            description: "Kupon na Netflix, Spotify nebo třeba předplatné časopisu.",
            estimatedPrice: 300,
            reasoning: "Zábava, která se hodí ke každému stylu života."
        });

        return tips.slice(0, 3);
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
      Jsi expert na dárky a pomáháš NÁVŠTĚVNÍKOVI vybrat skvělý dárek pro jeho kamaráda/blízkého na základě jeho seznamu přání.
      
      SEZNAM PŘÁNÍ OSLAVENCE (tyto věci oslavenec CHCE):
      ${wishList || 'Seznam je zatím prázdný.'}

      UŽ OBDRŽENÉ / VLASTNĚNÉ VĚCI (tyto věci oslavenec MÁ - slouží jako inspirace, co má rád):
      ${ownedList || 'Zatím žádné obdržené dárky.'}

      ${occasion ? `Příležitost: ${occasion}` : ''}

      Úkol:
      Navrhni 3 originální dárky, které by oslavence potěšily a hodily se k jeho stylu.
      
      Důležité podmínky:
      1. Nenavrhuj věci, které už jsou v seznamu přání nebo v seznamu obdržených dárků.
      2. Navrhuj dárky v RŮZNÝCH cenových hladinách.
      3. Odpověz v češtině.

      Odpověď vrať VÝHRADNĚ ve formátu JSON:
      {
        "tips": [
          {
            "title": "název dárku",
            "description": "stručný popis",
            "estimatedPrice": 123,
            "reasoning": "proč by to byl dobrý dárek"
          }
        ]
      }
    `;

        // Trying stable v1 models first to avoid 404s
        const modelsToTry = [
            { name: 'gemini-1.5-flash', version: 'v1' },
            { name: 'gemini-2.0-flash-exp', version: 'v1beta' },
            { name: 'gemini-1.5-pro', version: 'v1' }
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
                    break;
                }
            }
        }

        console.error('AI Service exhausted all models. Using smart fallback.', lastError);
        return this.getFallbackTips(wishes);
    }
}

export const aiService = AIService;
