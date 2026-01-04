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
        console.log("DárekList: Aktivován Smart Fallback v4.0");

        const allText = wishes.map(w => `${w.title} ${w.description || ''}`).join(' ').toLowerCase();
        const pool: AITip[] = [];

        // 1. Wellness / Péče o sebe
        if (allText.includes('maska') || allText.includes('vlasy') || allText.includes('péče') || allText.includes('kosmetik') || allText.includes('vana')) {
            pool.push({
                title: "Sada relaxačních esenciálních olejů",
                description: "Pro domácí wellness a hloubkovou relaxaci.",
                estimatedPrice: 650,
                reasoning: "Skvěle doplňuje váš zájem o péči o sebe."
            });
            pool.push({
                title: "Hedvábný povlak na polštář",
                description: "Luxusní doplněk pro zdravější pleť a vlasy.",
                estimatedPrice: 800,
                reasoning: "Péče o sebe pokračuje i ve spánku."
            });
            pool.push({
                title: "Bambusový stolek do vany",
                description: "Pro relaxaci s knihou nebo sklenkou vína.",
                estimatedPrice: 750,
                reasoning: "Ideální pro dlouhé relaxační koupele."
            });
        }

        // 2. Domov / Útulno
        if (allText.includes('povlečení') || allText.includes('mikroplyš') || allText.includes('byt') || allText.includes('domov') || allText.includes('polštář') || allText.includes('svíč')) {
            pool.push({
                title: "Teplý fleecový pléd",
                description: "Měkká deka na zimní večery u televize.",
                estimatedPrice: 600,
                reasoning: "Dokonalý doplněk pro útulný domov."
            });
            pool.push({
                title: "Aromatický difuzér s oleji",
                description: "Pro příjemnou vůni a atmosféru v ložnici.",
                estimatedPrice: 550,
                reasoning: "Zútulní prostor a vytvoří příjemnou náladu."
            });
            pool.push({
                title: "Designová stolní lampa",
                description: "S teplým světlem pro večerní čtení.",
                estimatedPrice: 1200,
                reasoning: "Krásný a funkční doplněk do interiéru."
            });
        }

        // 3. Nářadí / Kutil / Dílna
        if (allText.includes('nářadí') || allText.includes('kutil') || allText.includes('dílna') || allText.includes('šroub') || allText.includes('vrt')) {
            pool.push({
                title: "Magnetický náramek na šroubky",
                description: "Nositelný magnet pro práci s drobnými součástkami.",
                estimatedPrice: 350,
                reasoning: "Šikovný pomocník pro kutilské projekty."
            });
            pool.push({
                title: "LED čelovka s vysokým svitem",
                description: "Pro práci ve stísněných nebo tmavých prostorech.",
                estimatedPrice: 450,
                reasoning: "Nezbytnost v každé dílně pro volné ruce."
            });
            pool.push({
                title: "Organizér na drobné nářadí",
                description: "Přehledný kufřík pro šroubky a bity.",
                estimatedPrice: 400,
                reasoning: "Udrží v dílně perfektní pořádek."
            });
        }

        // 4. Elektronika / Tech
        if (allText.includes('logitech') || allText.includes('mouse') || allText.includes('myš') ||
            allText.includes('drone') || allText.includes('dji') || allText.includes('dron') ||
            allText.includes('watch') || allText.includes('hodinky') || allText.includes('prsten') ||
            allText.includes('projektor') || allText.includes('sluchátka') || allText.includes('mobil') ||
            allText.includes('samsung') || allText.includes('fractal') || allText.includes('pc') || allText.includes('kláves')) {
            pool.push({
                title: "USB-C dokovací stanice",
                description: "Pro připojení všech zařízení na jednom místě.",
                estimatedPrice: 1200,
                reasoning: "Praktický upgrade pro tech setup."
            });
            pool.push({
                title: "Bezdrátová nabíjecí podložka 3v1",
                description: "Pro mobil, hodinky i sluchátka najednou.",
                estimatedPrice: 800,
                reasoning: "Elegantní řešení pro nabíjení všech gadgetů."
            });
            pool.push({
                title: "Lokalizační čip (AirTag/SmartTag)",
                description: "Pro hlídání klíčů nebo peněženky.",
                estimatedPrice: 850,
                reasoning: "Užitečný pomocník pro zapomnětlivé techniky."
            });
        }

        // 5. Kuchyně / Gastronomie
        if (allText.includes('kuchy') || allText.includes('vaře') || allText.includes('péct') || allText.includes('jídlo') || allText.includes('nůž') || allText.includes('káva') || allText.includes('víno')) {
            pool.push({
                title: "Sada na domácí pěstování bylinek",
                description: "Inteligentní květináč s LED osvětlením.",
                estimatedPrice: 1500,
                reasoning: "Čerstvé bylinky do kuchyně po celý rok."
            });
            pool.push({
                title: "Kvalitní kuchařský nůž",
                description: "Z vysoce kvalitní nerezové oceli.",
                estimatedPrice: 1800,
                reasoning: "Základní nástroj pro každého nadšence do vaření."
            });
            pool.push({
                title: "Vakuová pumpa na víno",
                description: "Pro uchování čerstvosti rozpitých lahví.",
                estimatedPrice: 350,
                reasoning: "Nepostradatelný doplněk pro milovníky vína."
            });
        }

        // 6. Cestování / Outdoor
        if (allText.includes('cest') || allText.includes('výlet') || allText.includes('hory') || allText.includes('stan') || allText.includes('kufr') || allText.includes('leten')) {
            pool.push({
                title: "Cestovní organizéry do kufru",
                description: "Sada sáčků pro přehledné balení oblečení.",
                estimatedPrice: 450,
                reasoning: "Ušetří místo a udrží věci v pořádku na cestách."
            });
            pool.push({
                title: "Vysoce výkonná powerbanka",
                description: "S kapacitou 20000mAh a rychlonabíjením.",
                estimatedPrice: 900,
                reasoning: "Energie na dlouhé túry a cestování."
            });
            pool.push({
                title: "Stírací mapa světa",
                description: "Pro zaznamenávání navštívených míst.",
                estimatedPrice: 390,
                reasoning: "Krásná dekorace pro každého cestovatele."
            });
        }

        // 7. Čtení / Kultura
        if (allText.includes('kniha') || allText.includes('číst') || allText.includes('papír') || allText.includes('kino') || allText.includes('koncert')) {
            pool.push({
                title: "Stylová záložka do knihy",
                description: "Ručně vyráběná nebo kovová s motivem.",
                estimatedPrice: 200,
                reasoning: "Drobný dárek, který potěší každého čtenáře."
            });
            pool.push({
                title: "Lampička na knihu k připnutí",
                description: "Pro čtení v noci bez rušení okolí.",
                estimatedPrice: 350,
                reasoning: "Umožní číst kdekoli a kdykoli."
            });
            pool.push({
                title: "Předplatné literárního časopisu",
                description: "Nebo poukaz do knihkupectví.",
                estimatedPrice: 500,
                reasoning: "Pro stálý přísun nové inspirace ke čtení."
            });
        }

        // Univerzální tipy pro širší pool
        pool.push({
            title: "Předplatné streamovací služby",
            description: "Netflix, Disney+ nebo HBO na pár měsíců.",
            estimatedPrice: 600,
            reasoning: "Nekonečná zábava přímo v obýváku."
        });
        pool.push({
            title: "Degustační výběrová káva",
            description: "Balíček čerstvě pražených zrn z místní pražírny.",
            estimatedPrice: 480,
            reasoning: "Pravý zážitek pro milovníky kvalitní kávy."
        });
        pool.push({
            title: "Zážitková úniková hra",
            description: "Poukaz pro celou partu nebo rodinu.",
            estimatedPrice: 1200,
            reasoning: "Nezapomenutelný společný zážitek."
        });
        pool.push({
            title: "Sada na výrobu vlastního ginu",
            description: "DIY set s bylinkami a kořením.",
            estimatedPrice: 850,
            reasoning: "Originální a kreativní dárek pro dospělé."
        });
        pool.push({
            title: "Kapesní nůž Victorinox",
            description: "Legendární švýcarská kvalita pro každou situaci.",
            estimatedPrice: 950,
            reasoning: "Praktický nástroj, který vydrží celý život."
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

      Důležité: Nenavrhuj věci, které jsou už na seznamu nebo které oslavenec má. 
      Nenavrhuj příliš generické dárky jako "květiny" nebo "čokoláda", pokud k tomu nemáš specifický důvod.
      Odpověď vrať VÝHRADNĚ ve formátu JSON:
      {
        "tips": [
          {"title": "název", "description": "popis", "estimatedPrice": 123, "reasoning": "argument, proč se to hodí k jeho zájmům"}
        ]
      }
    `;

        const modelsToTry = [
            { name: 'gemini-2.0-flash-exp', version: 'v1beta' },
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
                            temperature: 0.8,
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
                    // Quota exceeded - wait or try different model (though usually quota is per project)
                    continue;
                }
            }
        }

        console.error('AI Service exhausted all models. Using smart fallback.', lastError);
        return this.getFallbackTips(wishes);
    }
}

export const aiService = AIService;
