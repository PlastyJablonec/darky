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

    static async analyzeGiftsAndGetTips(gifts: Gift[], occasion?: string): Promise<AITip[]> {
        if (!API_KEY) {
            throw new Error('Chybí API klíč pro Gemini AI (VITE_GEMINI_API_KEY).')
        }

        if (!this.genAI) {
            this.genAI = new GoogleGenerativeAI(API_KEY)
        }

        // Try gemini-1.5-flash first (cheaper and faster)
        let modelName = 'gemini-1.5-flash'
        let model = this.genAI.getGenerativeModel({ model: modelName })

        const giftsList = gifts
            .map((g) => `- ${g.title}${g.description ? `: ${g.description}` : ''}${g.price ? ` (${g.price} ${g.currency})` : ''}`)
            .join('\n')

        const prompt = `
      Jsi expert na dárky a pomáháš uživateli vybrat další dárky pro jeho seznam přání.
      Zde je aktuální seznam dárků, které uživatel už v seznamu má:
      ${giftsList || 'Seznam je zatím prázdný.'}

      ${occasion ? `Příležitost: ${occasion}` : ''}

      Na základě těchto dat navrhni 3 až 5 dalších dárků, které by se k těmto hodily nebo by mohly uživatele zajímat.
      Odpověz ve formátu JSON jako pole objektů s vlastnostmi:
      - title: název dárku (krátký a výstižný)
      - description: stručný popis dárku
      - estimatedPrice: odhadovaná cena v CZK (jen číslo, nebo null)
      - reasoning: proč jsi tento dárek vybral (vztah k aktuálním dárkům)

      Odpověz POUZE ve formátu JSON, bez jakéhokoliv dalšího textu nebo formátování. Jazyk musí být čeština.
    `

        try {
            let result
            try {
                result = await model.generateContent(prompt)
            } catch (e: any) {
                // Fallback to gemini-pro if flash is not found
                if (e.message?.includes('not found') || e.message?.includes('404')) {
                    console.warn('Gemini 1.5 Flash not found, falling back to gemini-pro')
                    modelName = 'gemini-pro'
                    model = this.genAI.getGenerativeModel({ model: modelName })
                    result = await model.generateContent(prompt)
                } else {
                    throw e
                }
            }

            const response = await result.response
            const text = response.text()

            try {
                // Remove markdown code blocks if present
                const jsonStr = text.replace(/```json|```/g, '').trim()
                const tips: AITip[] = JSON.parse(jsonStr)
                return tips
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError, 'Raw text:', text)
                throw new Error('AI vrátila nečitelný formát. Zkuste to prosím znovu.')
            }
        } catch (error: any) {
            console.error('Gemini AI Error Details:', error)

            // Better error messages for common issues
            if (error.message?.includes('API_KEY_INVALID')) {
                throw new Error('Váš API klíč pro Gemini není platný. Zkontrolujte ho v nastavení.')
            }
            if (error.message?.includes('quota')) {
                throw new Error('Dosáhli jste limitu požadavků pro AI. Zkuste to prosím později.')
            }

            throw new Error(`Chyba AI: ${error.message || 'Nepodařilo se získat návrhy.'}`)
        }
    }
}

export const aiService = AIService
