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

        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

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
            const result = await model.generateContent(prompt)
            const response = await result.response
            const text = response.text()

            // Remove markdown code blocks if present
            const jsonStr = text.replace(/```json|```/g, '').trim()
            const tips: AITip[] = JSON.parse(jsonStr)

            return tips
        } catch (error) {
            console.error('Gemini AI Error:', error)
            throw new Error('Nepodařilo se získat návrhy od AI. Zkontrolujte API klíč a připojení.')
        }
    }
}

export const aiService = AIService
