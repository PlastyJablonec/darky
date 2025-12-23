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
        // Jednoduchá logika pro alespoň trochu relevantní tipy, když AI nejede
        const titles = wishes.map(w => w.title.toLowerCase()).join(' ')
        const isTech = titles.includes('elektronika') || titles.includes('pc') || titles.includes('mobil')
        const isHome = titles.includes('byt') || titles.includes('kuchyň') || titles.includes('povlečení') || titles.includes('maska')
        const isHobbies = titles.includes('nářadí') || titles.includes('sport') || titles.includes('kutil')

        const tips: AITip[] = [
            {
                title: "Zážitkový poukaz",
                description: "Vstupenky do divadla, na koncert nebo degustační večeři.",
                estimatedPrice: 1500,
                reasoning: "Zážitky jsou skvělým doplňkem ke každému seznamu přání."
            }
        ]

        if (isHome) {
            tips.push({
                title: "Aromatická svíčka nebo difuzér",
                description: "Kvalitní vůně pro zútulnění domova.",
                estimatedPrice: 450,
                reasoning: "Doplňuje tvůj zájem o věci do domácnosti a relaxaci."
            })
        } else if (isHobbies) {
            tips.push({
                title: "Organizér nebo úložný box",
                description: "Praktický systém pro uložení věcí nebo nářadí.",
                estimatedPrice: 600,
                reasoning: "Pomůže ti udržet tvé hobby komponenty přehledně uspořádané."
            })
        } else {
            tips.push({
                title: "Výběrová káva nebo set čajů",
                description: "Degustační balíček pro gurmány.",
                estimatedPrice: 400,
                reasoning: "Univerzální dárek pro chvíle pohody."
            })
        }

        tips.push({
            title: "Dárková karta (Alza / Luxor / IKEA)",
            description: "Karta v libovolné hodnotě do tvého oblíbeného obchodu.",
            estimatedPrice: 1000,
            reasoning: "Nejjistější cesta, jak si pořídit přesně to, co ti v seznamu ještě chybí."
        })

        return tips
    }

    static async analyzeGiftsAndGetTips(wishes: Gift[], ownedGifts: Gift[], occasion?: string): Promise<AITip[]> {
        if (!API_KEY) {
            console.warn('Missing Gemini API Key. Using fallback tips.')
            return this.getFallbackTips(wishes)
        }

        const wishList = wishes
            .map((g) => `- ${g.title}${g.description ? `: ${g.description}` : ''}${g.price ? ` (${g.price} ${g.currency})` : ''}`)
            .join('\n')

        const ownedList = ownedGifts
            .map((g) => `- ${g.title}${g.description ? `: ${g.description}` : ''}`)
            .join('\n')

        const prompt = `
      Jsi expert na dárky a pomáháš NÁVŠTĚVNÍKOVI vybrat skvělý dárek pro jeho kamaráda/blízkého na základě jeho seznamu přání.
      
      SEZNAM PŘÁNÍ OSLAVENCE (tyto věci oslavenec CHCE):
      ${wishList || 'Seznam je zatím prázdný.'}

      UŽ OBDRŽENÉ / VLASTNĚNÉ VĚCI (tyto věci oslavenec MÁ - slouží jako inspirace, co má rád):
      ${ownedList || 'Zatím žádné obdržené dárky.'}

      ${occasion ? `Příležitost: ${occasion}` : ''}

      Úkol:
      Navrhni 3 až 5 dalších originálních dárků, které by oslavence potěšily a hodily se k jeho stylu.
      
      Důležité podmínky:
      1. Nenavrhuj věci, které už jsou v seznamu přání nebo v seznamu obdržených dárků.
      2. Navrhuj dárky v RŮZNÝCH cenových hladinách (od levných drobností po dražší věci).
      3. Odpověz v češtině, tón by měl být inspirativní a nápomocný pro někoho, kdo vybírá dárek.

      Odpověď vrať VÝHRADNĚ ve formátu JSON podle tohoto schématu:
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
    `

        // Valid model names for Gemini API
        // gemini-2.0-flash-exp works but often hits quota
        // gemini-1.5-flash often 404s if beta version is mismatched, but we'll try latest
        const modelsToTry = [
            'gemini-2.0-flash-exp',
            'gemini-1.5-flash-latest',
            'gemini-1.5-flash',
            'gemini-1.5-pro-latest'
        ]

        let lastError: any = null

        for (const modelName of modelsToTry) {
            try {
                const model = this.genAI!.getGenerativeModel({
                    model: modelName,
                    generationConfig: { responseMimeType: "application/json" }
                })

                const result = await model.generateContent(prompt)
                const response = await result.response
                const text = response.text()

                if (!text) continue

                const data = JSON.parse(text)
                return data.tips || data
            } catch (error: any) {
                lastError = error
                console.warn(`Model ${modelName} failed:`, error.message)

                // If it's a quota error or auth error, don't try other models for this call
                if (error.message?.includes('429') || error.message?.includes('403') || error.message?.includes('401')) {
                    break
                }
            }
        }

        console.error('AI Service exhausted all models. Using fallback.', lastError)
        return this.getFallbackTips(wishes)
    }
}

export const aiService = AIService
