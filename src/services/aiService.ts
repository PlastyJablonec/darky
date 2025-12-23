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

    private static getFallbackTips(): AITip[] {
        return [
            {
                title: "Zážitkový poukaz",
                description: "Vstupenky do divadla, na koncert nebo degustační večeři.",
                estimatedPrice: 1500,
                reasoning: "Zážitky jsou často lepší než hmotné dary a vždy potěší."
            },
            {
                title: "Kvalitní káva nebo čaj",
                description: "Výběrová zrnková káva nebo set sypaných čajů.",
                estimatedPrice: 400,
                reasoning: "Drobný, ale luxusní dárek pro každodenní potěšení."
            },
            {
                title: "Kniha od oblíbeného autora",
                description: "Novinka v žánru, který má oslavenec rád.",
                estimatedPrice: 350,
                reasoning: "Klasika, která nikdy nevyjde z módy."
            }
        ]
    }

    static async analyzeGiftsAndGetTips(wishes: Gift[], ownedGifts: Gift[], occasion?: string): Promise<AITip[]> {
        if (!API_KEY) {
            console.warn('Missing Gemini API Key. Using fallback tips.')
            return this.getFallbackTips()
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
        const modelsToTry = [
            'gemini-1.5-flash',
            'gemini-1.5-flash-8b',
            'gemini-1.5-pro'
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

                // If it's a quota error, don't try other models, just break and go to fallback
                if (error.message?.includes('429')) {
                    break
                }
            }
        }

        console.error('AI Service exhausted all models. Using fallback.', lastError)
        return this.getFallbackTips()
    }
}

export const aiService = AIService
