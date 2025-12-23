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

    static async analyzeGiftsAndGetTips(gifts: Gift[], occasion?: string): Promise<AITip[]> {
        if (!API_KEY) {
            throw new Error('Chybí API klíč pro Gemini AI (VITE_GEMINI_API_KEY).')
        }

        if (!this.ai) {
            this.ai = new GoogleGenAI({ apiKey: API_KEY })
        }

        const giftsList = gifts
            .map((g) => `- ${g.title}${g.description ? `: ${g.description}` : ''}${g.price ? ` (${g.price} ${g.currency})` : ''}`)
            .join('\n')

        const prompt = `
      Jsi expert na dárky a pomáháš uživateli vybrat další dárky pro jeho seznam přání.
      Zde je aktuální seznam dárků, které uživatel už v seznamu má:
      ${giftsList || 'Seznam je zatím prázdný.'}

      ${occasion ? `Příležitost: ${occasion}` : ''}

      Na základě těchto dat navrhni 3 až 5 dalších dárků, které by se k těmto hodily nebo by mohly uživatele zajímat.
    `

        // List of models to try in order of preference
        const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash-exp', 'gemini-1.5-pro']
        let lastError = null

        for (const modelName of modelsToTry) {
            try {
                console.log(`Zkouším AI model: ${modelName}...`)
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
                return data.tips || data // Support both wrapped and direct array if AI ignores schema slightly
            } catch (error: any) {
                console.warn(`Model ${modelName} selhal:`, error.message)
                lastError = error
                // If it's not a 404, it might be a payload/auth issue, so maybe don't retry other models?
                // But for now, let's try all if 404.
                if (!error.message?.includes('404')) {
                    // If it's a quota or auth error, stop early
                    if (error.message?.includes('429') || error.message?.includes('401') || error.message?.includes('403')) {
                        break
                    }
                }
            }
        }

        console.error('Všechny AI modely selhaly.', lastError)
        throw new Error(`Nepodařilo se najít funkční AI model. Poslední chyba: ${lastError?.message || 'Neznámá chyba'}`)
    }
}

export const aiService = AIService
