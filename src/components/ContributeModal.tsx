import { useState } from 'react'
import { X, MessageCircle } from 'lucide-react'
import type { GroupGiftSummary } from '@/types'

interface ContributeModalProps {
  isOpen: boolean
  onClose: () => void
  onContribute: (amount: number, message?: string, isAnonymous?: boolean) => Promise<void>
  summary: GroupGiftSummary
  userContribution?: {
    amount: number
    message?: string
    isAnonymous: boolean
  } | null
  isEditing?: boolean
}

export function ContributeModal({
  isOpen,
  onClose,
  onContribute,
  summary,
  userContribution,
  isEditing = false
}: ContributeModalProps) {
  const [amount, setAmount] = useState(userContribution?.amount?.toString() || '')
  const [message, setMessage] = useState(userContribution?.message || '')
  const [isAnonymous, setIsAnonymous] = useState(userContribution?.isAnonymous || false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const contributionAmount = parseFloat(amount)
    
    if (!contributionAmount || contributionAmount <= 0) {
      setError('Zadejte platnou částku')
      return
    }

    if (contributionAmount > summary.remainingAmount) {
      setError(`Maximální příspěvek je ${formatAmount(summary.remainingAmount)}`)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await onContribute(
        contributionAmount,
        message.trim() || undefined,
        isAnonymous
      )
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při odesílání příspěvku')
    } finally {
      setIsLoading(false)
    }
  }

  const suggestedAmounts = [
    Math.min(500, summary.remainingAmount),
    Math.min(1000, summary.remainingAmount),
    Math.min(2000, summary.remainingAmount),
    summary.remainingAmount
  ].filter((amount, index, arr) => amount > 0 && arr.indexOf(amount) === index)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Upravit příspěvek' : 'Přispět na dárek'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Gift Progress Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Cílová částka:</span>
              <span className="text-sm font-semibold text-blue-900">
                {formatAmount(summary.targetAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-800">Vybráno:</span>
              <span className="text-sm text-blue-800">
                {formatAmount(summary.totalContributed)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Zbývá:</span>
              <span className="text-sm font-semibold text-blue-900">
                {formatAmount(summary.remainingAmount)}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Částka (Kč) *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium text-sm">
                Kč
              </div>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input pl-10"
                placeholder="0"
                min="1"
                max={summary.remainingAmount}
                step="1"
                required
              />
            </div>
          </div>

          {/* Suggested Amounts */}
          {!isEditing && suggestedAmounts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Navrhované částky:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {suggestedAmounts.map((suggestedAmount) => (
                  <button
                    key={suggestedAmount}
                    type="button"
                    onClick={() => setAmount(suggestedAmount.toString())}
                    className="btn-outline text-sm py-2"
                  >
                    {formatAmount(suggestedAmount)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              <MessageCircle className="inline h-4 w-4 mr-1" />
              Zpráva pro ostatní přispěvatele (volitelné)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input"
              rows={3}
              placeholder="Například: 'Ráda se podílím na tomto krásném dárku!' nebo koordinační zpráva..."
            />
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAnonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-700">
              Přispět anonymně (ostatní neuvidí mé jméno)
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline flex-1"
              disabled={isLoading}
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
              ) : (
                isEditing ? 'Upravit příspěvek' : 'Přispět'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}