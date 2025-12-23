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

        // Diagnostic: Try to list models
        try {
            console.log('Provádím diagnostiku: Výpis dostupných modelů...')
            const modelList = await (this.ai as any).models.list()
            console.log('Dostupné modely pro tento klíč:', (modelList as any).map((m: any) => m.name))
        } catch (diagError: any) {
            console.warn('Nepodařilo se vypsat seznam modelů (možná omezený klíč):', diagError.message)
        }

        let lastError = null

        for (const modelName of modelsToTry) {
            try {
                console.log(`Zkouším AI model: ${modelName}... (Klíč začíná na: ${API_KEY?.substring(0, 6)}...)`)
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
                console.log(`Model ${modelName} úspěšně odpověděl!`)
                return data.tips || data
            } catch (error: any) {
                console.warn(`Model ${modelName} selhal:`, error.message)
                lastError = error

                // If quota exceeded or auth error, don't keep trying others that likely share the same quota
                if (error.message?.includes('429') || error.message?.includes('401') || error.message?.includes('403')) {
                    break
                }
            }
        }

        console.error('Všechny AI modely selhaly.', lastError)

        if (lastError?.message?.includes('limit: 0') || lastError?.message?.includes('429')) {
            throw new Error('Vaše AI Project nemá nastavenou kvótu pro tyto modely. Zkontrolujte prosím Google AI Studio (Free Tier vs Pay-as-you-go).')
        }

        throw new Error(`Nepodařilo se najít funkční AI model. Poslední chyba: ${lastError?.message || 'Neznámá chyba'}`)
    }
}

export const aiService = AIService
