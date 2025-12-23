import { useState, useEffect } from 'react'
import { Edit, Trash2, ExternalLink, ShoppingCart, Users, Lock, Plus, MessageCircle, CheckCircle, X, ThumbsUp } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { giftService } from '@/services/giftService'
import { contributionService } from '@/services/contributionService'
import { suggestionService } from '@/services/suggestionService'
import { AuthDialog } from './AuthDialog'
import { OptimizedImage } from './OptimizedImage'
import { GroupGiftProgress } from './GroupGiftProgress'
import { ContributeModal } from './ContributeModal'
import { ContributorChat } from './ContributorChat'
import type { GroupGiftSummary, Contribution, GiftWithReserver } from '@/types'

type Gift = GiftWithReserver

interface EnhancedGiftCardProps {
  gift: Gift
  isOwner: boolean
  onEdit?: (gift: Gift) => void
  onDelete?: (gift: Gift) => void
  onReserve?: (gift: Gift) => void
  onUnreserve?: (gift: Gift) => void
  showReserved?: boolean
}

export function EnhancedGiftCard({
  gift,
  isOwner,
  onEdit,
  onDelete,
  onReserve,
  onUnreserve,
  showReserved = false
}: EnhancedGiftCardProps) {
  const { user } = useAuth()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authAction, setAuthAction] = useState('')
  const [showContributeModal, setShowContributeModal] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [groupSummary, setGroupSummary] = useState<GroupGiftSummary | null>(null)
  const [userContribution, setUserContribution] = useState<Contribution | null>(null)
  const [, setLoading] = useState(false)
  const [suggestionCount, setSuggestionCount] = useState(0)
  const [hasUserSuggested, setHasUserSuggested] = useState(false)

  const isReservedByCurrentUser = gift.reserved_by === user?.id
  const canReserve = !isOwner && !gift.is_reserved && !gift.is_group_gift
  const canUnreserve = !isOwner && isReservedByCurrentUser && !gift.is_group_gift
  const canContribute = !isOwner && gift.is_group_gift && !gift.is_reserved
  const hasContributed = userContribution !== null

  useEffect(() => {
    if (gift.is_group_gift && !isOwner) {
      loadGroupGiftData()
    }
    if (!gift.is_group_gift && !isOwner && user) {
      loadSuggestionData()
    }
  }, [gift.id, gift.is_group_gift, isOwner, user])

  const loadGroupGiftData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const [summary, contribution] = await Promise.all([
        contributionService.getGroupGiftSummary(gift.id),
        contributionService.getUserContribution(gift.id)
      ])
      setGroupSummary(summary)
      setUserContribution(contribution)
    } catch (error) {
      console.error('Error loading group gift data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSuggestionData = async () => {
    if (!user) return

    try {
      const [count, userSuggested] = await Promise.all([
        suggestionService.getSuggestionCount(gift.id),
        suggestionService.hasUserSuggested(gift.id)
      ])
      setSuggestionCount(count)
      setHasUserSuggested(userSuggested)
    } catch (error) {
      console.error('Error loading suggestion data:', error)
    }
  }

  const formatPrice = (price: number | null, currency: string) => {
    return giftService.formatPrice(price, currency)
  }

  const getPriorityColor = (priority: string) => {
    return giftService.getPriorityColor(priority)
  }

  const getPriorityLabel = (priority: string) => {
    return giftService.getPriorityLabel(priority)
  }

  const handleAuthAction = (action: string, callback: () => void) => {
    if (!user) {
      setAuthAction(action)
      setShowAuthDialog(true)
    } else {
      callback()
    }
  }

  const handleContribute = async (amount: number, message?: string, isAnonymous?: boolean) => {
    if (userContribution) {
      // Update existing contribution
      await contributionService.updateContribution(userContribution.id, {
        amount,
        message,
        isAnonymous
      })
    } else {
      // Create new contribution
      await contributionService.createContribution({
        giftId: gift.id,
        amount,
        currency: gift.currency,
        message,
        isAnonymous
      })
    }

    // If there's a message and user is not anonymous, also send it to chat
    if (message && message.trim() && !isAnonymous) {
      try {
        await contributionService.sendContributionMessage(gift.id, message.trim())
      } catch (error) {
        console.error('Error sending chat message:', error)
        // Don't fail the whole operation if chat message fails
      }
    }

    // Reload data
    await loadGroupGiftData()
  }

  const handleDeleteContribution = async () => {
    if (!userContribution) return

    if (confirm('Opravdu chcete zrušit svůj příspěvek?')) {
      try {
        await contributionService.deleteContribution(userContribution.id)
        await loadGroupGiftData()
      } catch (error) {
        console.error('Error deleting contribution:', error)
        alert('Chyba při rušení příspěvku: ' + (error instanceof Error ? error.message : 'Neznámá chyba'))
      }
    }
  }

  const handleSuggestGroupGift = async () => {
    try {
      await suggestionService.suggestGroupGift(gift.id)
      await loadSuggestionData() // Refresh suggestion data
    } catch (error) {
      console.error('Error suggesting group gift:', error)
      alert('Chyba při navrhování skupinového dárku: ' + (error instanceof Error ? error.message : 'Neznámá chyba'))
    }
  }

  const handleAgreeAndContribute = async () => {
    try {
      // First suggest (agree with the proposal)
      await suggestionService.suggestGroupGift(gift.id)

      // Check if we should convert to group gift (e.g., after 2+ suggestions)
      const count = await suggestionService.getSuggestionCount(gift.id)
      if (count >= 2) {
        // Convert to group gift
        await suggestionService.convertToGroupGift(gift.id)
        // Reload the page data to show as group gift and then open contribute modal
        window.location.reload()
        // Note: After reload, user will see group gift and can click contribute
      } else {
        // Just refresh suggestion data - dárek ještě není skupinový
        await loadSuggestionData()
        alert('Váš souhlas byl zaznamenán! Jakmile bude dostatek návrhů, dárek se automaticky převede na skupinový.')
      }
    } catch (error) {
      console.error('Error agreeing with suggestion:', error)
      alert('Chyba při souhlasu s návrhem: ' + (error instanceof Error ? error.message : 'Neznámá chyba'))
    }
  }

  const handleRemoveSuggestion = async () => {
    if (confirm('Opravdu chcete zrušit svůj návrh skupinového dárku?')) {
      try {
        await suggestionService.removeSuggestion(gift.id)
        await loadSuggestionData() // Refresh suggestion data
      } catch (error) {
        console.error('Error removing suggestion:', error)
        alert('Chyba při rušení návrhu: ' + (error instanceof Error ? error.message : 'Neznámá chyba'))
      }
    }
  }

  const handlePriceClick = () => {
    if (!user) {
      setAuthAction('zobrazit přesnou cenu')
      setShowAuthDialog(true)
    }
  }

  const handleProductUrlClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault()
      setAuthAction('zobrazit odkaz na produkt')
      setShowAuthDialog(true)
    }
  }

  // Maskování ceny pro neregistrované uživatele
  const displayPrice = () => {
    if (!gift.price) return null
    if (!user) {
      return (
        <button
          onClick={handlePriceClick}
          className="text-lg font-bold text-primary-600 hover:text-primary-700 transition-colors relative group"
        >
          <span className="filter blur-sm">
            {formatPrice(gift.price, gift.currency)}
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="h-4 w-4 text-primary-600" />
          </div>
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Klikněte pro zobrazení ceny
          </div>
        </button>
      )
    }
    return (
      <span className="text-lg font-bold text-primary-600">
        {formatPrice(gift.price, gift.currency)}
      </span>
    )
  }

  return (
    <div className={`card hover:shadow-md transition-all duration-200 flex flex-col h-full ${gift.is_reserved && (!isOwner || showReserved) ? 'opacity-75 bg-gray-50' : ''
      }`}>
      {gift.image_url && (
        <div className="relative">
          <OptimizedImage
            src={gift.image_url}
            alt={gift.title}
            className="w-full h-40 sm:h-48 rounded-t-lg"
            aspectRatio={1.5}
            objectFit="cover"
            clickable={true}
          />
          {gift.is_reserved && (!isOwner || showReserved) && (
            <div className="absolute inset-0 bg-black bg-opacity-30 rounded-t-lg flex items-center justify-center">
              <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                {gift.is_group_gift ? 'Plně financováno' : 'Rezervováno'}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="card-header flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-h-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {gift.title}
            </h3>

            {gift.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {gift.description}
              </p>
            )}

            <div className="flex items-center space-x-2 mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(gift.priority)}`}>
                {getPriorityLabel(gift.priority)}
              </span>

              {gift.is_group_gift && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Users className="h-3 w-3 mr-1" />
                  Skupinový
                </span>
              )}

              {displayPrice()}
            </div>

            {gift.product_url && (
              <a
                href={gift.product_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleProductUrlClick}
                className={`inline-flex items-center text-sm transition-colors relative group ${user
                  ? 'text-primary-600 hover:text-primary-700'
                  : 'text-gray-400 cursor-pointer hover:text-primary-600'
                  }`}
              >
                {user ? (
                  <ExternalLink className="h-4 w-4 mr-1" />
                ) : (
                  <Lock className="h-4 w-4 mr-1" />
                )}
                {user ? 'Zobrazit produkt' : 'Odkaz na produkt'}
                {!user && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Přihlaste se pro odkaz
                  </div>
                )}
              </a>
            )}
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <div className="flex items-center space-x-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(gift)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Upravit"
                >
                  <Edit className="h-4 w-4 text-gray-500" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(gift)}
                  className="p-2 hover:bg-red-100 rounded-full transition-colors"
                  title="Smazat"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons for Non-owners */}
        {!isOwner && (
          <div className="space-y-2 mt-auto">
            {/* Regular Gift Actions */}
            {!gift.is_group_gift && (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  {canReserve && onReserve && (
                    <button
                      onClick={() => handleAuthAction('rezervovat dárek', () => onReserve(gift))}
                      className="btn-primary flex items-center space-x-2 flex-1"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Rezervovat</span>
                    </button>
                  )}

                  {canUnreserve && onUnreserve && (
                    <button
                      onClick={() => onUnreserve(gift)}
                      className="btn-outline flex items-center space-x-2 flex-1"
                    >
                      <X className="h-4 w-4" />
                      <span>Zrušit rezervaci</span>
                    </button>
                  )}

                  {gift.is_reserved && !isReservedByCurrentUser && (
                    <div className="flex items-center justify-center text-sm text-gray-500 flex-1 py-2">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Rezervováno
                    </div>
                  )}
                </div>

                {/* Suggest Group Gift Option */}
                {!gift.is_reserved && gift.price && gift.price > 1000 && (
                  <div className="space-y-2">
                    {!hasUserSuggested ? (
                      <button
                        onClick={() => handleAuthAction('navrhnout skupinový dárek', handleSuggestGroupGift)}
                        className="btn-outline flex items-center space-x-2 w-full text-sm py-2"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>
                          Navrhnout jako skupinový
                          {suggestionCount > 0 && ` (${suggestionCount})`}
                        </span>
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          className="btn-outline bg-blue-50 text-blue-700 border-blue-200 flex items-center space-x-2 flex-1 text-sm py-2"
                          disabled
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>Navrženo ({suggestionCount})</span>
                        </button>
                        <button
                          onClick={() => handleRemoveSuggestion()}
                          className="btn-outline text-red-600 hover:bg-red-50 flex items-center space-x-1 px-3 text-sm py-2"
                          title="Zrušit návrh"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {/* Show suggestions from others */}
                    {suggestionCount > 0 && !hasUserSuggested && (
                      <button
                        onClick={() => handleAuthAction('souhlasit s návrhem', handleAgreeAndContribute)}
                        className="btn-primary flex items-center space-x-2 w-full text-sm py-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Souhlasit a přispět ({suggestionCount} lidí navrhlo)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Group Gift Actions */}
            {gift.is_group_gift && (
              <div className="space-y-2">
                {/* No target price warning */}
                {(!gift.price || gift.price <= 0) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm">
                    <p className="text-yellow-800">
                      ⚠️ Tento skupinový dárek nemá nastavenou cílovou cenu.
                      Kontaktujte vlastníka seznamu.
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex space-x-2">
                  {canContribute && !gift.is_reserved && gift.price && gift.price > 0 && (
                    <>
                      <button
                        onClick={() => handleAuthAction('přispět na dárek', () => setShowContributeModal(true))}
                        className={`flex items-center space-x-2 ${hasContributed ? 'flex-1' : 'flex-1'} ${hasContributed ? 'btn-outline' : 'btn-primary'
                          }`}
                      >
                        <Plus className="h-4 w-4" />
                        <span>{hasContributed ? 'Upravit příspěvek' : 'Přispět'}</span>
                      </button>

                      {hasContributed && (
                        <button
                          onClick={() => handleDeleteContribution()}
                          className="btn-outline text-red-600 hover:bg-red-50 flex items-center space-x-2"
                          title="Zrušit příspěvek"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </>
                  )}

                  {hasContributed && groupSummary && groupSummary.contributorCount > 1 && !gift.is_reserved && (
                    <button
                      onClick={() => setShowChat(!showChat)}
                      className="btn-outline flex items-center space-x-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Chat</span>
                    </button>
                  )}

                  {gift.is_reserved && (
                    <div className="flex items-center justify-center text-sm text-gray-500 flex-1 py-2">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Plně financováno
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Group Gift Progress */}
      {gift.is_group_gift && !isOwner && groupSummary && (
        <div className="px-6 pb-4">
          <GroupGiftProgress
            summary={groupSummary}
            showContributors={true}
          />
        </div>
      )}

      {/* Contributor Chat */}
      {showChat && hasContributed && !isOwner && (
        <div className="px-6 pb-4">
          <ContributorChat giftId={gift.id} />
        </div>
      )}

      {gift.is_reserved && (!isOwner || showReserved) && (
        <div className="card-footer">
          <div className="text-xs text-gray-500">
            {gift.is_group_gift ? 'Plně financováno' : 'Rezervováno'} {gift.reserved_at && new Date(gift.reserved_at).toLocaleDateString('cs-CZ')}
            {isOwner && gift.reserved_by_profile && (
              <span className="block font-medium text-blue-600 mt-1">
                Rezervoval: {gift.reserved_by_profile.display_name || gift.reserved_by_profile.email}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        action={authAction}
      />

      {showContributeModal && groupSummary && (
        <ContributeModal
          isOpen={showContributeModal}
          onClose={() => setShowContributeModal(false)}
          onContribute={handleContribute}
          summary={groupSummary}
          userContribution={userContribution ? {
            amount: userContribution.amount,
            message: userContribution.message,
            isAnonymous: userContribution.isAnonymous
          } : null}
          isEditing={hasContributed}
        />
      )}
    </div>
  )
}