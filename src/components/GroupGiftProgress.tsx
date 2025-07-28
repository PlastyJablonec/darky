import { CheckCircle, Users } from 'lucide-react'
import type { GroupGiftSummary } from '@/types'

interface GroupGiftProgressProps {
  summary: GroupGiftSummary
  showContributors?: boolean
  className?: string
}

export function GroupGiftProgress({ 
  summary, 
  showContributors = true, 
  className = '' 
}: GroupGiftProgressProps) {
  const progressPercentage = summary.targetAmount > 0 
    ? Math.min(100, (summary.totalContributed / summary.targetAmount) * 100)
    : 0

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium text-gray-900">Skupinový dárek</h3>
          {summary.isFullyFunded && (
            <CheckCircle className="h-5 w-5 text-green-600" />
          )}
        </div>
        <div className="text-sm text-gray-600">
          {summary.contributorCount} {summary.contributorCount === 1 ? 'přispěvatel' : 'přispěvatelů'}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {formatAmount(summary.totalContributed)} / {formatAmount(summary.targetAmount)}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              summary.isFullyFunded 
                ? 'bg-green-500' 
                : 'bg-blue-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <div className="text-sm">
          {summary.isFullyFunded ? (
            <span className="text-green-600 font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Cíl dosažen!
            </span>
          ) : (
            <span className="text-gray-600">
              Zbývá: <span className="font-medium text-gray-900">
                {formatAmount(summary.remainingAmount)}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Contributors List */}
      {showContributors && summary.contributions.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Přispěvatelé:</h4>
          <div className="space-y-2">
            {summary.contributions.map((contribution) => (
              <div key={contribution.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-gray-700">
                    {contribution.contributorName}
                  </span>
                </div>
                <span className="font-medium text-gray-900">
                  {formatAmount(contribution.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages hint */}
      {summary.contributorCount > 1 && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Přispěvatelé si mohou vzájemně psát zprávy
          </p>
        </div>
      )}
    </div>
  )
}