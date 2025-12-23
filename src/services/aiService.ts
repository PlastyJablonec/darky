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

        // List of models to try. Including the one from your other project!
        const modelsToTry = [
            'gemini-2.5-flash',       // Exact string from your other project
            'gemini-1.5-flash',
            'gemini-1.5-flash-latest',
            'gemini-2.0-flash-exp'
        ]

        // Diagnostic: Try to list models
        try {
            console.log('Provádím diagnostiku: Výpis dostupných modelů...')
            const modelList: any = await (this.ai as any).models.list()
            console.log('Surová odpověď diagnostiky:', modelList)

            // Try to extract model names robustly
            const models = Array.isArray(modelList) ? modelList : (modelList.models || [])
            if (Array.isArray(models)) {
                console.log('Dostupné modely pro tento klíč:', models.map((m: any) => m.name))
            }
        } catch (diagError: any) {
            console.warn('Nepodařilo se vypsat seznam modelů:', diagError.message)
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
                console.log(`✅ Model ${modelName} úspěšně odpověděl!`)
                return data.tips || data
            } catch (error: any) {
                console.warn(`❌ Model ${modelName} selhal:`, error.message)
                lastError = error

                // If it's a quota error (429) or limit: 0, we should probably stop if it's consistent
                if (error.message?.includes('429') || error.message?.includes('403') || error.message?.includes('401')) {
                    // But we'll try other models anyway just in case only some are disabled
                }
            }
        }

        console.error('Všechny AI modely selhaly.', lastError)

        if (lastError?.message?.includes('limit: 0') || lastError?.message?.includes('429')) {
            throw new Error('Chyba kvóty (429): Váš projekt v Google AI Studiu nemá povolen tento model nebo jste překročili limit (v Free tieru je limit na gemini-2.0-flash-exp často 0).')
        }

        throw new Error(`Nepodařilo se najít funkční AI model. Poslední chyba (${modelsToTry[modelsToTry.length - 1]}): ${lastError?.message || 'Neznámá chyba'}`)
    }
}

export const aiService = AIService
