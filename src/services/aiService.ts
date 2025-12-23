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

        try {
            // Using gemini-1.5-flash as it's stable and widely available.
            const response = await this.ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
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
                }
            })

            const text = response.text
            if (!text) throw new Error('AI nevrátila žádnou odpověď.')

            const tips: AITip[] = JSON.parse(text)
            return tips
        } catch (error: any) {
            console.error('Gemini AI Error Details:', error)

            if (error.message?.includes('404')) {
                throw new Error('Model AI nebyl nalezen. Zkontrolujte prosím nastavení v Google AI Studiu.')
            }

            throw new Error(`Nepodařilo se získat návrhy: ${error.message || 'Neznámá chyba'}`)
        }
    }
}

export const aiService = AIService
