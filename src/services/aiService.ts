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
        console.log("DárekList: Aktivován Smart Fallback v3.0 (Tech Edition)");

        if (wishes.length === 0) {
            return [
                {
                    title: "Zážitkový poukaz na míru",
                    description: "Vstupenky na akci podle tvých zájmů.",
                    estimatedPrice: 1500,
                    reasoning: "Univerzální dárek pro začátek."
                },
                {
                    title: "Dárková karta do Alzy",
                    description: "Karta do technického obchodu na cokoliv.",
                    estimatedPrice: 1000,
                    reasoning: "Nejjistější volba."
                }
            ];
        }

        const allText = wishes.map(w => `${w.title} ${w.description || ''}`).join(' ').toLowerCase();
        const pool: AITip[] = [];

        // 1. Elektronika / Tech
        const isTech = allText.includes('logitech') || allText.includes('mouse') || allText.includes('myš') ||
            allText.includes('drone') || allText.includes('dji') || allText.includes('dron') ||
            allText.includes('watch') || allText.includes('hodinky') || allText.includes('prsten') ||
            allText.includes('projektor') || allText.includes('sluchátka') || allText.includes('mobil') ||
            allText.includes('samsung') || allText.includes('fractal') || allText.includes('pc') ||
            allText.includes('case') || allText.includes('skříň');

        if (isTech) {
            pool.push({
                title: "Kvalitní USB-C hub / dokovací stanice",
                description: "Pro připojení všech tvých zařízení na jednom místě.",
                estimatedPrice: 1200,
                reasoning: "Hodí se k tvé sbírce elektroniky a gadgetů."
            });
            pool.push({
                title: "Bezdrátová nabíjecí podložka",
                description: "Pro mobil, hodinky i sluchátka najednou.",
                estimatedPrice: 800,
                reasoning: "Praktický doplněk pro tech nadšence."
            });
        }

        // 2. Pájení / DIY elektronika
        const isSoldering = allText.includes('páje') || allText.includes('pájk') || allText.includes('flux') ||
            allText.includes('cín') || allText.includes('solder');

        if (isSoldering) {
            pool.push({
                title: "Třetí ruka s lupou a LED osvětlením",
                description: "Držák pro přesné pájení s integrovanou lupou.",
                estimatedPrice: 450,
                reasoning: "Nezbytnost pro každého, kdo páje."
            });
            pool.push({
                title: "Sada kvalitních pinzet pro SMD",
                description: "Antistatické pinzety různých tvarů.",
                estimatedPrice: 350,
                reasoning: "Pro přesnou práci s malými součástkami."
            });
        }

        // 3. Auto / Car accessories
        const isCar = allText.includes('auto') || allText.includes('podložk') || allText.includes('detektor') ||
            allText.includes('radar') || allText.includes('vysavač') || allText.includes('genevo') ||
            allText.includes('eibach');

        if (isCar) {
            pool.push({
                title: "Autokosmetika - sada na detailing",
                description: "Profesionální set na péči o lak a interiér.",
                estimatedPrice: 900,
                reasoning: "Pro někoho, kdo si potrpí na své auto."
            });
            pool.push({
                title: "Organizér do kufru auta",
                description: "Skládací box na udržení pořádku v kufru.",
                estimatedPrice: 600,
                reasoning: "Praktický doplněk pro každého řidiče."
            });
        }

        // 4. Gaming
        const isGaming = allText.includes('volant') || allText.includes('ps5') || allText.includes('xbox') ||
            allText.includes('rally') || allText.includes('assetto') || allText.includes('corsa') ||
            allText.includes('hra') || allText.includes('game') || allText.includes('playstation');

        if (isGaming) {
            pool.push({
                title: "Herní podložka pod myš XXL",
                description: "Velká podložka pro racing setup nebo FPS hry.",
                estimatedPrice: 500,
                reasoning: "Upgrade pro tvůj herní setup."
            });
            pool.push({
                title: "RGB LED pásek pro gaming setup",
                description: "Ambientní osvětlení pro lepší atmosféru.",
                estimatedPrice: 400,
                reasoning: "Vizuální vylepšení herního prostředí."
            });
        }

        // 5. 3D tisk
        const is3DPrint = allText.includes('3d') || allText.includes('tiskárna') || allText.includes('filament') ||
            allText.includes('bambu') || allText.includes('prusa') || allText.includes('ender');

        if (is3DPrint) {
            pool.push({
                title: "Sada kvalitních filamentů",
                description: "Kolekce PLA/PETG v různých barvách.",
                estimatedPrice: 800,
                reasoning: "Materiál na další projekty nikdy není dost."
            });
            pool.push({
                title: "Sada nástrojů pro 3D tisk",
                description: "Škrabky, kleště, pilníky pro post-processing.",
                estimatedPrice: 450,
                reasoning: "Pro dokonalé dokončení výtisků."
            });
        }

        // 6. Doplněk k prvnímu dárku (vždy přidat)
        const firstGift = wishes[0];
        pool.push({
            title: `Příslušenství k: ${firstGift.title}`,
            description: `Kvalitní doplněk, který rozšíří možnosti "${firstGift.title}".`,
            estimatedPrice: firstGift.price ? Math.round(firstGift.price * 0.25) : 400,
            reasoning: "Vybrali jsme podle prvního přání v tvém seznamu."
        });

        // Zamíchat a vrátit 3
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

        const modelsToTry = [
            { name: 'gemini-1.5-flash', version: 'v1beta' },
            { name: 'gemini-1.5-flash', version: 'v1' },
            { name: 'gemini-1.5-pro', version: 'v1beta' },
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
