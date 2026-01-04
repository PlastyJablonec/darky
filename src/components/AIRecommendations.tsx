import { useState } from 'react'
import { Sparkles, Loader2, Plus, Brain } from 'lucide-react'
import { aiService, AITip } from '@/services/aiService'
import type { Gift } from '@/types'

interface AIRecommendationsProps {
    wishes: Gift[]
    receivedGifts: Gift[]
    occasion?: string | null
    onAddGift?: (giftData: { title: string; description: string; price?: number }) => void
}

export function AIRecommendations({ wishes, receivedGifts, occasion, onAddGift }: AIRecommendationsProps) {
    const [loading, setLoading] = useState(false)
    const [tips, setTips] = useState<AITip[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isExpanded, setIsExpanded] = useState(false)

    const handleGetTips = async () => {
        try {
            setLoading(true)
            setError(null)
            const results = await aiService.analyzeGiftsAndGetTips(wishes, receivedGifts, occasion || undefined)
            setTips(results)
            setIsExpanded(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Něco se nepovedlo')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6 shadow-sm mb-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-200/20 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-purple-200/20 rounded-full blur-2xl" />

            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm border border-indigo-50">
                            <Brain className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 leading-none">Chybí vám inspirace?</h3>
                            <p className="text-sm text-gray-600 mt-1">AI analyzuje seznam a navrhne skvělý dárek</p>
                        </div>
                    </div>

                    <button
                        onClick={handleGetTips}
                        disabled={loading}
                        className="btn-primary bg-indigo-600 hover:bg-indigo-700 border-none shadow-md shadow-indigo-200 flex items-center justify-center space-x-2 px-6 py-2.5 transition-all active:scale-95 disabled:opacity-70"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Analyzuji...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-5 w-5" />
                                <span>Získat tipy</span>
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg flex items-start space-x-2">
                        <span className="font-bold">Chyba:</span>
                        <span>{error}</span>
                    </div>
                )}

                {isExpanded && tips.length > 0 && (
                    <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-top-4 duration-500">
                        {tips.map((tip, index) => (
                            <div
                                key={index}
                                className="bg-white/70 backdrop-blur-md border border-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                            >
                                <div>
                                    <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                        {tip.title}
                                    </h4>
                                    {tip.estimatedPrice && (
                                        <span className="text-xs font-semibold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                                            cca {tip.estimatedPrice} Kč
                                        </span>
                                    )}
                                    <p className="text-sm text-gray-600 mt-2 line-clamp-3 italic">
                                        "{tip.reasoning}"
                                    </p>
                                </div>

                                <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-50">
                                    <span className="text-xs text-gray-400 flex items-center">
                                        {tip.source === 'ai' ? (
                                            <>
                                                <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
                                                <span className="text-amber-600 font-medium">AI Expert</span>
                                            </>
                                        ) : (
                                            <>
                                                <Brain className="h-3 w-3 mr-1 text-indigo-400" />
                                                <span>Chytrý návrh</span>
                                            </>
                                        )}
                                    </span>
                                    {onAddGift && (
                                        <button
                                            onClick={() => onAddGift({
                                                title: tip.title,
                                                description: tip.description,
                                                price: tip.estimatedPrice
                                            })}
                                            className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                            title="Přidat do seznamu"
                                        >
                                            <Plus className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
