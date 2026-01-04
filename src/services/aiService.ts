import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Gift } from '@/types'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

export interface AITip {
    title: string
    description: string
    estimatedPrice?: number
    reasoning: string
    source?: 'ai' | 'fallback'
}

export class AIService {
    private static genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

    private static getFallbackTips(wishes: Gift[]): AITip[] {
        console.log("DárekList: Generuji tipy ze Smart Fallback v4.2");

        const allText = wishes.map(w => `${w.title} ${w.description || ''}`).join(' ').toLowerCase();
        const pool: AITip[] = [];

        // 1. Wellness / Péče o sebe / Krása
        if (
            allText.includes('maska') || allText.includes('vlasy') || allText.includes('péče') ||
            allText.includes('kosmetik') || allText.includes('vana') || allText.includes('krém') ||
            allText.includes('pěna') || allText.includes('parfém') || allText.includes('balzám') ||
            allText.includes('tonikum') || allText.includes('zrcadlo') || allText.includes('líčení') ||
            allText.includes('pleť') || allText.includes('makeup') || allText.includes('vůně') ||
            allText.includes('oči') || allText.includes('rtěnka') || allText.includes('sada')
        ) {
            pool.push({
                title: "Sada relaxačních esenciálních olejů",
                description: "Pro domácí wellness a hloubkovou relaxaci.",
                estimatedPrice: 650,
                reasoning: "Ideální doplněk pro někoho, kdo o sebe rád pečuje.",
                source: 'fallback'
            });
            pool.push({
                title: "Hedvábný povlak na polštář",
                description: "Luxusní doplněk pro zdravější pleť a vlasy.",
                estimatedPrice: 800,
                reasoning: "Péče o pleť a vlasy pokračuje i během spánku.",
                source: 'fallback'
            });
            pool.push({
                title: "Bambusový stolek do vany",
                description: "Pro relaxaci s knihou nebo sklenkou vína.",
                estimatedPrice: 750,
                reasoning: "Pro dokonalý zážitek z domácích lázní.",
                source: 'fallback'
            });
            pool.push({
                title: "Kosmetické zrcátko s LED osvětlením",
                description: "S nastavitelným jasem pro perfektní líčení.",
                estimatedPrice: 850,
                reasoning: "Nepostradatelný pomocník každé beauty rutiny.",
                source: 'fallback'
            });
        }

        // 2. Domov / Útulno / Dekorace
        if (
            allText.includes('povlečení') || allText.includes('mikroplyš') || allText.includes('byt') ||
            allText.includes('domov') || allText.includes('polštář') || allText.includes('svíč') ||
            allText.includes('vůně') || allText.includes('aroma') || allText.includes('dekor') ||
            allText.includes('lamp') || allText.includes('obraz')
        ) {
            pool.push({
                title: "Teplý fleecový pléd",
                description: "Měkká deka na zimní večery u televize.",
                estimatedPrice: 600,
                reasoning: "Pro ještě útulnější a pohodovější domov.",
                source: 'fallback'
            });
            pool.push({
                title: "Aromatický difuzér s oleji",
                description: "Pro příjemnou vůni a atmosféru v interiéru.",
                estimatedPrice: 550,
                reasoning: "Vytvoří v domově uklidňující a voňavé prostředí.",
                source: 'fallback'
            });
            pool.push({
                title: "Designová stolní lampa",
                description: "S teplým světlem pro večerní čtení.",
                estimatedPrice: 1200,
                reasoning: "Krásný a funkční doplněk, který oživí interiér.",
                source: 'fallback'
            });
        }

        // 3. Nářadí / Kutil / DIY
        if (
            allText.includes('nářadí') || allText.includes('kutil') || allText.includes('dílna') ||
            allText.includes('šroub') || allText.includes('vrt') || allText.includes('oprav') ||
            allText.includes('měř') || allText.includes('metr')
        ) {
            pool.push({
                title: "Magnetický náramek na šroubky",
                description: "Nositelný magnet pro práci s drobnými součástkami.",
                estimatedPrice: 350,
                reasoning: "Praktický pomocník pro každého kutila.",
                source: 'fallback'
            });
            pool.push({
                title: "LED čelovka s vysokým svitem",
                description: "Pro práci ve stísněných nebo tmavých prostorech.",
                estimatedPrice: 450,
                reasoning: "Nezbytnost pro práci, kde potřebujete volné ruce.",
                source: 'fallback'
            });
            pool.push({
                title: "Organizér na drobné nářadí",
                description: "Přehledný kufřík pro šroubky, bity a hmoždinky.",
                estimatedPrice: 400,
                reasoning: "Udrží v dílně nebo garáži perfektní systém.",
                source: 'fallback'
            });
        }

        // 4. Elektronika / Tech / Gadgets
        if (
            allText.includes('logitech') || allText.includes('mouse') || allText.includes('myš') ||
            allText.includes('drone') || allText.includes('dji') || allText.includes('dron') ||
            allText.includes('watch') || allText.includes('hodinky') || allText.includes('prsten') ||
            allText.includes('projektor') || allText.includes('sluchátka') || allText.includes('mobil') ||
            allText.includes('samsung') || allText.includes('fractal') || allText.includes('pc') ||
            allText.includes('kláves') || allText.includes('usb') || allText.includes('nabíj')
        ) {
            pool.push({
                title: "USB-C dokovací stanice",
                description: "Pro připojení všech periferií jediným kabelem.",
                estimatedPrice: 1200,
                reasoning: "Zvýší komfort při práci i zábavě s technikou.",
                source: 'fallback'
            });
            pool.push({
                title: "Bezdrátová nabíjecí podložka 3v1",
                description: "Pro mobil, hodinky i sluchátka na jednom místě.",
                estimatedPrice: 800,
                reasoning: "Moderní a čisté řešení pro nabíjení všech zařízení.",
                source: 'fallback'
            });
            pool.push({
                title: "Lokalizační čip (AirTag/SmartTag)",
                description: "Pro snadné nalezení klíčů, peněženky nebo batohu.",
                estimatedPrice: 850,
                reasoning: "Praktický gadget pro klidnější každodenní život.",
                source: 'fallback'
            });
        }

        // 5. Kuchyně / Gastro / Káva & Víno
        if (
            allText.includes('kuchy') || allText.includes('vaře') || allText.includes('péct') ||
            allText.includes('jídlo') || allText.includes('nůž') || allText.includes('káva') ||
            allText.includes('víno') || allText.includes('čaj') || allText.includes('degust') ||
            allText.includes('pánev') || allText.includes('hrnec')
        ) {
            pool.push({
                title: "Sada na domácí pěstování bylinek",
                description: "Inteligentní květináč s automatickým svícením.",
                estimatedPrice: 1500,
                reasoning: "Pro čerstvé bylinky při vaření po celý rok.",
                source: 'fallback'
            });
            pool.push({
                title: "Kvalitní kuchařský nůž",
                description: "Z vysoce kvalitní nerezové oceli pro přesný řez.",
                estimatedPrice: 1800,
                reasoning: "Základní kámen výbavy každého nadšeného kuchaře.",
                source: 'fallback'
            });
            pool.push({
                title: "Vakuová pumpa na víno",
                description: "Pro uchování chuti a vůně i v otevřené lahvi.",
                estimatedPrice: 350,
                reasoning: "Zajistí, že víno zůstane déle čerstvé a chutné.",
                source: 'fallback'
            });
        }

        // 6. Cestování / Outdoor / Sport
        if (
            allText.includes('cest') || allText.includes('výlet') || allText.includes('hory') ||
            allText.includes('stan') || allText.includes('kufr') || allText.includes('leten') ||
            allText.includes('sport') || allText.includes('běh') || allText.includes('kolo') ||
            allText.includes('batoh') || allText.includes('spacák')
        ) {
            pool.push({
                title: "Cestovní organizéry do zavazadla",
                description: "Sada pro dokonale přehledné a úsporné balení.",
                estimatedPrice: 450,
                reasoning: "Ušetří čas i místo při balení na každou cestu.",
                source: 'fallback'
            });
            pool.push({
                title: "Vysoce výkonná powerbanka",
                description: "S kapacitou 20000mAh pro vícenásobné nabití.",
                estimatedPrice: 900,
                reasoning: "Energie na cesty pro mobil i další elektroniku.",
                source: 'fallback'
            });
            pool.push({
                title: "Stírací mapa světa",
                description: "Elegantní dekorace pro zaznamenávání procestovaných zemí.",
                estimatedPrice: 390,
                reasoning: "Inspirace pro další dobrodružství a vzpomínky z cest.",
                source: 'fallback'
            });
        }

        // 7. Čtení / Kultura / Kreativita
        if (
            allText.includes('kniha') || allText.includes('číst') || allText.includes('papír') ||
            allText.includes('kino') || allText.includes('koncert') || allText.includes('psát') ||
            allText.includes('malov') || allText.includes('kreativ') || allText.includes('design')
        ) {
            pool.push({
                title: "Stylová kovová záložka",
                description: "Elegantní záložka pro vášnivé čtenáře.",
                estimatedPrice: 200,
                reasoning: "Krásný a praktický doplněk pro každou rozečtenou knihu.",
                source: 'fallback'
            });
            pool.push({
                title: "Klipová lampička na čtení",
                description: "Kompaktní světlo pro čtení v noci bez rušení okolí.",
                estimatedPrice: 350,
                reasoning: "Umožní se začíst do příběhu kdekoli a kdykoli.",
                source: 'fallback'
            });
            pool.push({
                title: "Předplatné literárního časopisu",
                description: "Pravidelná dávka čtení a inspirace do schránky.",
                estimatedPrice: 500,
                reasoning: "Pro stálý kontakt s novinkami ze světa literatury.",
                source: 'fallback'
            });
        }

        // Základní pool univerzálních dárků (pokud se nic netrefilo)
        if (pool.length === 0) {
            pool.push({
                title: "Univerzální dárkový poukaz",
                description: "Do oblíbeného nákupního centra nebo e-shopu.",
                estimatedPrice: 1000,
                reasoning: "Jistota, že si oslavenec vybere přesně to, co chce.",
                source: 'fallback'
            });
            pool.push({
                title: "Předplatné streamovací služby",
                description: "Netflix, Disney+ nebo HBO na pár měsíců zábavy.",
                estimatedPrice: 600,
                reasoning: "Přinese spoustu filmových a seriálových zážitků.",
                source: 'fallback'
            });
            pool.push({
                title: "Degustační výběrová káva",
                description: "Balíček čerstvě pražených zrn z celého světa.",
                estimatedPrice: 480,
                reasoning: "Zpříjemní každé ráno šálkem skvělé chuti.",
                source: 'fallback'
            });
            pool.push({
                title: "Sada na výrobu vlastního ginu",
                description: "Kreativní DIY set pro přípravu vlastních příchutí.",
                estimatedPrice: 850,
                reasoning: "Originální zážitek pro všechny, co rádi experimentují.",
                source: 'fallback'
            });
        }

        // Zamíchat a vrátit 3
        return pool.sort(() => 0.5 - Math.random()).slice(0, 3);
    }

    private static parseRobustJSON(text: string): any {
        if (!text) return null;
        const cleaned = text.replace(/```json\s*|\s*```/g, '').trim();
        try {
            return JSON.parse(cleaned);
        } catch (e) {
            const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
            if (match) {
                try {
                    return JSON.parse(match[0]);
                } catch (e2) {
                    try {
                        let fixed = match[0];
                        const openBraces = (fixed.match(/\{/g) || []).length;
                        const closeBraces = (fixed.match(/\}/g) || []).length;
                        if (openBraces > closeBraces) fixed += '}'.repeat(openBraces - closeBraces);

                        const openBrackets = (fixed.match(/\[/g) || []).length;
                        const closeBrackets = (fixed.match(/\]/g) || []).length;
                        if (openBrackets > closeBrackets) fixed += ']'.repeat(openBrackets - closeBrackets);

                        return JSON.parse(fixed);
                    } catch (e3) {
                        console.error("DárekList: JSON parsování selhalo.");
                        throw e;
                    }
                }
            }
            throw e;
        }
    }

    static async analyzeGiftsAndGetTips(wishes: Gift[], ownedGifts: Gift[], occasion?: string): Promise<AITip[]> {
        if (!this.genAI) return this.getFallbackTips(wishes);

        const wishesList = wishes.length > 0
            ? wishes.map((w, i) => `${i + 1}. ${w.title}${w.description ? ` (${w.description})` : ''}`).join('\n')
            : 'Prázdný seznam';

        const prompt = `
      Jsi špičkový expert na dárky a nákupní poradce. Tvým úkolem je navrhnout 3 dárky, které na seznamu NEROZUMI, ale skvěle ho doplňují.

      SEZNAM PŘÁNÍ (Tyto věci uživatel CHCE, takže je NIKDY nenavrhuj znovu):
      ${wishesList}
      
      UŽIVATEL JIŽ VLASTNÍ / NECHCE:
      ${ownedGifts.length > 0 ? ownedGifts.map(g => g.title).join(', ') : 'Nic'}
      
      ${occasion ? `PŘÍLEŽITOST: ${occasion}` : ''}
      
      INSTRUKCE PRO NÁVRH:
      1. ABSOLUTNÍ ZÁKAZ DUPLICIT: Nenavrhuj nic, co už je na Seznamu přání nebo v seznamu Již vlastní.
      2. KONTEXTOVÉ DOPLNĚNÍ (DÁREK, KTERÝ SEDÍ): Pokud má uživatel na seznamu konkrétní techniku (např. Samsung Watch Ultra), navrhni k nim doplněk (např. kvalitní náhradní řemínek, nabíjecí stojánek nebo ochranu), ale ne další podobné hodinky.
      3. BUĎ KONKRÉTNÍ: Místo obecného "příslušenství" navrhni konkrétní a zajímavý produkt (např. "Designová dockovací stanice pro Apple/Samsung").
      4. ČESKY: Celá odpověď musí být v češtině.

      Odpověď vrať VÝHRADNĚ jako JSON objekt:
      {
        "tips": [
          {
            "title": "název dárku",
            "description": "stručný popis (max 150 znaků)",
            "estimatedPrice": 1200, 
            "reasoning": "vysvětlení, proč je to skvělý doplněk k existujícímu seznamu"
          }
        ]
      }
    `;

        const modelsToTry = [
            { name: 'gemini-3-flash-preview', version: 'v1beta', jsonMode: true },
            { name: 'gemini-2.5-flash', version: 'v1beta', jsonMode: true },
            { name: 'gemini-2.0-flash', version: 'v1beta', jsonMode: true },
            { name: 'gemini-1.5-flash', version: 'v1', jsonMode: false }
        ];

        let lastError: any = null;

        for (const modelCfg of modelsToTry) {
            const attempts = modelCfg.jsonMode ? [true, false] : [false];
            for (const useJson of attempts) {
                try {
                    const config: any = {
                        temperature: 0.7,
                        maxOutputTokens: 2048,
                    };
                    if (useJson) config.responseMimeType = "application/json";

                    const model = this.genAI!.getGenerativeModel(
                        { model: modelCfg.name, generationConfig: config },
                        { apiVersion: modelCfg.version as any }
                    );

                    console.log(`DárekList: Zkouším ${modelCfg.name} (${modelCfg.version}, JSON: ${useJson})...`);
                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    const text = response.text();

                    if (!text) continue;

                    const data = this.parseRobustJSON(text);
                    const tipsList = data.tips || (Array.isArray(data) ? data : []);
                    return tipsList.map((t: any) => ({ ...t, source: 'ai' }));
                } catch (error: any) {
                    lastError = error;
                    if (useJson && (error.message?.includes('400') || error.message?.includes('Unknown name'))) {
                        console.warn(`DárekList: ${modelCfg.name} nepodporuje JSON Mode, zkouším bez něj...`);
                        continue;
                    }
                    console.warn(`DárekList: ${modelCfg.name} selhal:`, error.message);
                    if (error.message?.includes('429')) await new Promise(r => setTimeout(r, 1000));
                    break;
                }
            }
        }

        console.error('DárekList: AI vyčerpáno.', lastError);
        return this.getFallbackTips(wishes);
    }
}

export const aiService = AIService;
