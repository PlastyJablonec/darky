import { GoogleGenAI, Type } from '@google/genai'
import type { Gift } from '@/types'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

export interface AITip {
    title: string
    description: string
    estimatedPrice?: number
    reasoning: string
}

export class AIService {
    private static ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null

    static async analyzeGiftsAndGetTips(wishes: Gift[], ownedGifts: Gift[], occasion?: string): Promise<AITip[]> {
        if (!API_KEY) {
            throw new Error('Chybí API klíč pro Gemini AI (VITE_GEMINI_API_KEY).')
        }

        if (!this.ai) {
            this.ai = new GoogleGenAI({ apiKey: API_KEY })
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
    `

        // List of models to try.
        const modelsToTry = [
            'gemini-1.5-flash',
            'gemini-1.5-flash-latest',
            'gemini-2.0-flash-exp'
        ]

        let lastError = null

        for (const modelName of modelsToTry) {
            try {
                const response = await this.ai.models.generateContent({
                    model: modelName,
                    contents: prompt,
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                tips: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            title: { type: Type.STRING },
                                            description: { type: Type.STRING },
                                            estimatedPrice: { type: Type.NUMBER },
                                            reasoning: { type: Type.STRING }
                                        },
                                        required: ['title', 'description', 'reasoning']
                                    }
                                }
                            },
                            required: ['tips']
                        }
                    }
                })

                const text = response.text
                if (!text) throw new Error('AI nevrátila žádnou odpověď.')

                const data = JSON.parse(text)
                return data.tips || data
            } catch (error: any) {
                lastError = error
                if (error.message?.includes('429') || error.message?.includes('403') || error.message?.includes('401')) {
                    break
                }
            }
        }

        console.error('AI selhala:', lastError)
        throw new Error(`Nepodařilo se získat návrhy: ${lastError?.message || 'Neznámá chyba'}`)
    }
}

export const aiService = AIService
