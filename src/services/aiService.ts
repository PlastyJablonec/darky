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
        console.log("DárekList: Aktivován Smart Fallback v3.1");

        if (wishes.length === 0) {
            return [
                {
                    title: "Zážitkový poukaz na míru",
                    description: "Vstupenky na akci podle tvých zájmů.",
                    estimatedPrice: 1500,
                    reasoning: "Univerzální dárek pro začátek."
                },
                {
                    title: "Dárková karta",
                    description: "Do oblíbeného obchodu na cokoliv.",
                    estimatedPrice: 1000,
                    reasoning: "Nejjistější volba."
                }
            ];
        }

        const allText = wishes.map(w => `${w.title} ${w.description || ''}`).join(' ').toLowerCase();
        const pool: AITip[] = [];

        // 1. Wellness / Péče o sebe (maska, vlasy, kosmetika)
        if (allText.includes('maska') || allText.includes('vlasy') || allText.includes('péče') || allText.includes('kosmetik')) {
            pool.push({
                title: "Sada relaxačních esenciálních olejů",
                description: "Pro domácí wellness a hloubkovou relaxaci.",
                estimatedPrice: 650,
                reasoning: "Skvěle doplňuje tvůj zájem o péči o sebe."
            });
            pool.push({
                title: "Hedvábný povlak na polštář",
                description: "Luxusní doplněk pro zdravější pleť a vlasy.",
                estimatedPrice: 800,
                reasoning: "Péče o sebe pokračuje i ve spánku."
            });
        }

        // 2. Domov / Povlečení / Byt
        if (allText.includes('povlečení') || allText.includes('mikroplyš') || allText.includes('byt') || allText.includes('domov') || allText.includes('polštář')) {
            pool.push({
                title: "Teplý fleecový pléd",
                description: "Měkká deka na zimní večery u televize.",
                estimatedPrice: 600,
                reasoning: "Dokonalý doplněk k útulnému povlečení."
            });
            pool.push({
                title: "Aromatický difuzér s oleji",
                description: "Pro příjemnou vůni a atmosféru v ložnici.",
                estimatedPrice: 550,
                reasoning: "Zútulní prostor, kde máš nové povlečení."
            });
        }

        // 3. Nářadí / Kutil / Dílna
        if (allText.includes('nářadí') || allText.includes('kutil') || allText.includes('dílna') || allText.includes('šroub')) {
            pool.push({
                title: "Magnetický náramek na šroubky",
                description: "Nositelný magnet pro práci s drobnými součástkami.",
                estimatedPrice: 350,
                reasoning: "Šikovný pomocník pro tvé kutilské projekty."
            });
            pool.push({
                title: "LED čelovka s vysokým svitem",
                description: "Pro práci ve stísněných nebo tmavých prostorech.",
                estimatedPrice: 450,
                reasoning: "Nezbytnost v každé dílně."
            });
        }

        // 4. Elektronika / Tech
        if (allText.includes('logitech') || allText.includes('mouse') || allText.includes('myš') ||
            allText.includes('drone') || allText.includes('dji') || allText.includes('dron') ||
            allText.includes('watch') || allText.includes('hodinky') || allText.includes('prsten') ||
            allText.includes('projektor') || allText.includes('sluchátka') || allText.includes('mobil') ||
            allText.includes('samsung') || allText.includes('fractal') || allText.includes('pc')) {
            pool.push({
                title: "USB-C hub / dokovací stanice",
                description: "Pro připojení všech zařízení na jednom místě.",
                estimatedPrice: 1200,
                reasoning: "Praktický doplněk pro tech nadšence."
            });
            pool.push({
                title: "Bezdrátová nabíjecí podložka 3v1",
                description: "Pro mobil, hodinky i sluchátka najednou.",
                estimatedPrice: 800,
                reasoning: "Elegantní řešení pro nabíjení gadgetů."
            });
        }

        // 5. Pájení / DIY elektronika
        if (allText.includes('páje') || allText.includes('pájk') || allText.includes('flux') || allText.includes('cín')) {
            pool.push({
                title: "Třetí ruka s lupou a LED",
                description: "Držák pro přesné pájení s integrovanou lupou.",
                estimatedPrice: 450,
                reasoning: "Nezbytnost pro každého, kdo páje."
            });
            pool.push({
                title: "Sada antistatických pinzet",
                description: "Různé tvary pro práci s SMD součástkami.",
                estimatedPrice: 350,
                reasoning: "Pro přesnou práci s malými díly."
            });
        }

        // 6. Auto
        if (allText.includes('auto') || allText.includes('podložk') || allText.includes('detektor') ||
            allText.includes('radar') || allText.includes('vysavač') || allText.includes('genevo') || allText.includes('eibach')) {
            pool.push({
                title: "Sada na detailing auta",
                description: "Profesionální péče o lak a interiér.",
                estimatedPrice: 900,
                reasoning: "Pro někoho, kdo si potrpí na své auto."
            });
        }

        // 7. Gaming
        if (allText.includes('volant') || allText.includes('ps5') || allText.includes('xbox') ||
            allText.includes('rally') || allText.includes('assetto') || allText.includes('game')) {
            pool.push({
                title: "Herní podložka XXL",
                description: "Velká podložka pro racing nebo FPS setup.",
                estimatedPrice: 500,
                reasoning: "Upgrade pro tvůj herní setup."
            });
        }

        // 8. 3D tisk
        if (allText.includes('3d') || allText.includes('filament') || allText.includes('bambu') || allText.includes('prusa')) {
            pool.push({
                title: "Sada kvalitních filamentů",
                description: "Kolekce PLA/PETG v různých barvách.",
                estimatedPrice: 800,
                reasoning: "Materiál na další projekty."
            });
        }

        // Záložní univerzální tipy (pouze pokud máme málo tipů)
        if (pool.length < 2) {
            pool.push({
                title: "Předplatné oblíbené služby",
                description: "Netflix, Spotify nebo Audible na pár měsíců.",
                estimatedPrice: 500,
                reasoning: "Prémiová zábava pro volné chvíle."
            });
            pool.push({
                title: "Degustační balíček kávy",
                description: "Výběr zrnkových káv z různých koutů světa.",
                estimatedPrice: 450,
                reasoning: "Pro milovníky kvalitní kávy."
            });
        }

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
