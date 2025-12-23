import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Share2, Eye, Users, ThumbsUp, CheckCircle, X, Shield, ArrowUpDown, Filter } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { EnhancedGiftCard } from '@/components/EnhancedGiftCard'
import { GiftModal } from '@/components/GiftModal'
import { ShareButtons } from '@/components/ShareButtons'
import { AccessControl } from '@/components/AccessControl'
import { useAuth } from '@/context/AuthContext'
import { useGifts } from '@/hooks/useGifts'
import { wishlistService } from '@/services/wishlistService'
import { ShareService } from '@/services/shareService'
import { suggestionService, GiftSuggestion } from '@/services/suggestionService'
import { AIRecommendations } from '@/components/AIRecommendations'
import type { Database } from '@/types'

type Wishlist = Database['public']['Tables']['wishlists']['Row']
type Gift = Database['public']['Tables']['gifts']['Row']

type SortOption = 'date_desc' | 'date_asc' | 'price_asc' | 'price_desc'
type FilterOption = 'all' | 'available' | 'reserved'

export function WishlistDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const {
    gifts,
    loading: giftsLoading,
    error: giftsError,
    createGift,
    updateGift,
    deleteGift,
    reserveGift,
    unreserveGift,
  } = useGifts(id || null)

  const [wishlist, setWishlist] = useState<Wishlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false)
  const [editingGift, setEditingGift] = useState<Gift | null>(null)
  const [deletingGift, setDeletingGift] = useState<Gift | null>(null)
  const [shareInfo, setShareInfo] = useState<any>(null)
  const [suggestions, setSuggestions] = useState<{ [giftId: string]: GiftSuggestion[] }>({})
  const [, setLoadingSuggestions] = useState(false)
  const [showAccessControl, setShowAccessControl] = useState(false)
  const [showConvertDialog, setShowConvertDialog] = useState(false)

  // Sorting and Filtering State
  const [sortBy, setSortBy] = useState<SortOption>('date_desc')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')

  const [aiGiftData, setAiGiftData] = useState<{ title: string; description: string; price?: number } | null>(null)

  const isOwner = wishlist?.user_id === user?.id

  // Load suggestions for owner
  useEffect(() => {
    if (isOwner && gifts.length > 0) {
      loadSuggestions()
    }
  }, [isOwner, gifts])

  const loadSuggestions = async () => {
    if (!isOwner || !gifts.length) return

    try {
      setLoadingSuggestions(true)
      const suggestionData: { [giftId: string]: GiftSuggestion[] } = {}

      for (const gift of gifts) {
        if (!gift.is_group_gift) {
          const giftSuggestions = await suggestionService.getGiftSuggestions(gift.id)
          if (giftSuggestions.length > 0) {
            suggestionData[gift.id] = giftSuggestions
          }
        }
      }

      setSuggestions(suggestionData)
    } catch (error) {
      console.error('Error loading suggestions:', error)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleConvertToGroupGift = async (giftId: string) => {
    try {
      await suggestionService.convertToGroupGift(giftId)
      // Reload gifts to show as group gift
      window.location.reload()
    } catch (error) {
      console.error('Error converting to group gift:', error)
      alert('Chyba při převádění na skupinový dárek: ' + (error instanceof Error ? error.message : 'Neznámá chyba'))
    }
  }

  const handleDismissSuggestions = async (giftId: string) => {
    if (confirm('Opravdu chcete odmítnout všechne návrhy pro tento dárek?')) {
      // For now, just remove from local state
      // In a real app, you might want to mark suggestions as dismissed
      setSuggestions(prev => {
        const { [giftId]: removed, ...rest } = prev
        return rest
      })
    }
  }

  useEffect(() => {
    async function fetchWishlist() {
      if (!id) return

      try {
        setLoading(true)
        const data = await wishlistService.getWishlist(id)
        if (data) {
          setWishlist(data)
        } else {
          setError('Seznam nebyl nalezen')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Chyba při načítání')
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [id])

  // Načíst informace o sdílení pro vlastníka
  useEffect(() => {
    async function fetchShareInfo() {
      if (!wishlist || !isOwner) return

      try {
        const info = await ShareService.getShareInfo(wishlist.id)
        setShareInfo(info)
      } catch (error) {
        console.error('Chyba při načítání share info:', error)
      }
    }

    fetchShareInfo()
  }, [wishlist, isOwner])

  const handleCreateGift = async (data: {
    title: string
    description?: string
    price?: number
    productUrl?: string
    imageUrl?: string
    priority?: 'low' | 'medium' | 'high'
    isGroupGift?: boolean
  }) => {
    try {
      await createGift(data)
      setIsGiftModalOpen(false)
    } catch (error) {
      console.error('Error creating gift:', error)
    }
  }

  const handleUpdateGift = async (data: {
    title: string
    description?: string
    price?: number
    productUrl?: string
    imageUrl?: string
    priority?: 'low' | 'medium' | 'high'
    isGroupGift?: boolean
  }) => {
    if (!editingGift) return

    try {
      await updateGift(editingGift.id, data)
      setEditingGift(null)
    } catch (error) {
      console.error('Error updating gift:', error)
    }
  }

  const handleDeleteGift = async () => {
    if (!deletingGift) return

    try {
      await deleteGift(deletingGift.id)
      setDeletingGift(null)
    } catch (error) {
      console.error('Error deleting gift:', error)
    }
  }

  const handleReserveGift = async (gift: Gift) => {
    try {
      await reserveGift(gift.id)
    } catch (error) {
      console.error('Error reserving gift:', error)
    }
  }

  const handleUnreserveGift = async (gift: Gift) => {
    try {
      await unreserveGift(gift.id)
    } catch (error) {
      console.error('Error unreserving gift:', error)
    }
  }

  const handleAddAIRecommendedGift = (giftData: { title: string; description: string; price?: number }) => {
    setEditingGift(null)
    setAiGiftData(giftData)
    setIsGiftModalOpen(true)
  }

  const handleConvertToManaged = async () => {
    if (!wishlist) return

    try {
      const updated = await wishlistService.updateWishlistType(wishlist.id, 'managed')
      setWishlist(updated)
      setShowConvertDialog(false)
    } catch (error) {
      console.error('Error converting wishlist:', error)
      alert('Chyba při převádění seznamu: ' + (error instanceof Error ? error.message : 'Neznámá chyba'))
    }
  }

  // Filter and Sort Logic
  const filteredAndSortedGifts = gifts
    .filter(gift => {
      if (filterBy === 'all') return true
      if (filterBy === 'available') return !gift.is_reserved
      if (filterBy === 'reserved') return gift.is_reserved
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date_desc': // Newest first
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'date_asc': // Oldest first
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'price_asc': // Cheapest first
          // Treat null price as 0 or Infinity? Usually 0 or put at end.
          // Let's treat null as 0 for "price unknown/low" or maybe max?
          // Defaulting to 0 for simplicity
          return (a.price || 0) - (b.price || 0)
        case 'price_desc': // Most expensive first
          return (b.price || 0) - (a.price || 0)
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  if (error || !wishlist) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || 'Seznam nebyl nalezen'}</p>
          <Link to="/wishlists" className="btn-primary">
            Zpět na seznamy
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-2 sm:space-x-4">
            <Link
              to="/wishlists"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation flex-shrink-0 mt-1"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{wishlist.title}</h1>
              {wishlist.description && (
                <p className="text-gray-600 mt-1 break-words">{wishlist.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {wishlist.is_public && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Share2 className="h-3 w-3 mr-1" />
                    Veřejný
                  </span>
                )}
                {shareInfo && shareInfo.totalViews > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Eye className="h-3 w-3 mr-1" />
                    {shareInfo.totalViews} zobrazení
                  </span>
                )}
                {shareInfo && shareInfo.shares.length > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <Users className="h-3 w-3 mr-1" />
                    Sdíleno s {shareInfo.shares.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-y-0 sm:space-x-3 pl-11 sm:pl-0">
            {wishlist.is_public && wishlist.share_id && (
              <ShareButtons
                wishlistTitle={wishlist.title}
                shareUrl={`${window.location.origin}/shared/${wishlist.share_id}`}
                userName={user?.user_metadata?.display_name || user?.email}
                onShare={(platform) => console.log('Sdíleno na:', platform)}
              />
            )}

            {isOwner && (
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center mr-2">
                  {wishlist.type === 'managed' ? (
                    <span className="text-sm text-green-600 font-medium flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Spravovaný seznam
                    </span>
                  ) : (
                    <button
                      onClick={() => setShowConvertDialog(true)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Převést na spravovaný seznam
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowAccessControl(true)}
                  className="btn-outline flex items-center justify-center space-x-2 w-full sm:w-auto"
                  title="Spravovat přístupy uživatelů"
                >
                  <Shield className="h-5 w-5" />
                  <span>Správa přístupů</span>
                </button>
                <button
                  onClick={() => setIsGiftModalOpen(true)}
                  className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
                >
                  <Plus className="h-5 w-5" />
                  <span>Přidat dárek</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {wishlist.type === 'managed' && isOwner && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 max-w-full">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Spravovaný seznam</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Jako správce tohoto seznamu <strong>vidíte všechny rezervace</strong>.
                    To vám umožňuje koordinovat dárky (např. pro děti), ale přicházíte o překvapení.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI recommendations section */}
        {isOwner && gifts.length > 0 && (
          <AIRecommendations
            gifts={gifts}
            occasion={wishlist.occasion}
            onAddGift={handleAddAIRecommendedGift}
          />
        )}

        {/* Group Gift Suggestions Section for Owner */}
        {isOwner && Object.keys(suggestions).length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <ThumbsUp className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">
                Návrhy na skupinové dárky
              </h3>
            </div>
            <p className="text-blue-700 text-sm">
              Uživatelé navrhli, aby se tyto dárky staly skupinovými. Můžete je schválit nebo odmítnout.
            </p>

            <div className="space-y-3">
              {Object.entries(suggestions).map(([giftId, giftSuggestions]) => {
                const gift = gifts.find(g => g.id === giftId)
                if (!gift) return null

                return (
                  <div key={giftId} className="bg-white border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{gift.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {giftSuggestions.length} {giftSuggestions.length === 1 ? 'návrh' : 'návrhy'} na skupinový dárek
                        </p>
                        <div className="text-xs text-gray-500">
                          Navrhli: {giftSuggestions.map(s => s.suggestedByName).join(', ')}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleConvertToGroupGift(giftId)}
                          className="btn-primary text-sm py-1 px-3 flex items-center space-x-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Schválit</span>
                        </button>
                        <button
                          onClick={() => handleDismissSuggestions(giftId)}
                          className="btn-outline text-red-600 hover:bg-red-50 text-sm py-1 px-3 flex items-center space-x-1"
                        >
                          <X className="h-4 w-4" />
                          <span>Odmítnout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Filter Bar */}
        {!giftsLoading && !giftsError && gifts.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100 gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {/* Filter - Visible only to visitors or managed list owners */}
              {(!isOwner || wishlist.type === 'managed') && (
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 sm:hidden">Filtr:</span>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                    className="block w-full sm:w-40 pl-3 pr-8 py-1.5 text-sm font-sans border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md bg-white text-gray-900"
                  >
                    <option value="all">Všechny dárky</option>
                    <option value="available">K dispozici</option>
                    <option value="reserved">Rezervované</option>
                  </select>
                </div>
              )}

              {/* Sort - Always visible */}
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 sm:hidden">Řazení:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="block w-full sm:w-40 pl-3 pr-8 py-1.5 text-sm font-sans border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md bg-white text-gray-900"
                >
                  <option value="date_desc">Nejnovější</option>
                  <option value="date_asc">Nejstarší</option>
                  <option value="price_asc">Od nejlevnějšího</option>
                  <option value="price_desc">Od nejdražšího</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-500 hidden sm:block font-sans">
              {filteredAndSortedGifts.length} {filteredAndSortedGifts.length === 1 ? 'dárek' : filteredAndSortedGifts.length >= 2 && filteredAndSortedGifts.length <= 4 ? 'dárky' : 'dárků'}
            </div>
          </div>
        )}

        {giftsLoading ? (
          <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
          </div>
        ) : giftsError ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{giftsError}</p>
          </div>
        ) : gifts.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Zatím žádné dárky
              </h3>
              <p className="text-gray-600 mb-6">
                {isOwner
                  ? 'Přidejte první dárek do svého seznamu přání.'
                  : 'V tomto seznamu zatím nejsou žádné dárky.'}
              </p>
              {isOwner && (
                <button
                  onClick={() => setIsGiftModalOpen(true)}
                  className="btn-primary"
                >
                  Přidat první dárek
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedGifts.map((gift) => (
              <EnhancedGiftCard
                key={gift.id}
                gift={gift}
                isOwner={isOwner}
                onEdit={(gift) => setEditingGift(gift)}
                onDelete={(gift) => setDeletingGift(gift)}
                onReserve={handleReserveGift}
                onUnreserve={handleUnreserveGift}
                showReserved={wishlist.type === 'managed'}
              />
            ))}
          </div>
        )}

        <GiftModal
          isOpen={isGiftModalOpen}
          onClose={() => {
            setIsGiftModalOpen(false)
            setAiGiftData(null)
          }}
          onSubmit={handleCreateGift}
          title="Přidat nový dárek"
          aiData={aiGiftData || undefined}
        />

        <GiftModal
          isOpen={!!editingGift}
          onClose={() => setEditingGift(null)}
          onSubmit={handleUpdateGift}
          title="Upravit dárek"
          initialData={editingGift || undefined}
        />

        {deletingGift && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Smazat dárek
              </h3>
              <p className="text-gray-600 mb-6">
                Opravdu chcete smazat dárek "{deletingGift.title}"?
                Tato akce je nevratná.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeletingGift(null)}
                  className="btn-outline flex-1"
                >
                  Zrušit
                </button>
                <button
                  onClick={handleDeleteGift}
                  className="btn-primary bg-red-600 hover:bg-red-700 flex-1"
                >
                  Smazat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Access Control Modal */}
        {showAccessControl && (
          <AccessControl
            wishlistId={wishlist.id}
            onClose={() => setShowAccessControl(false)}
          />
        )}

        {/* Convert Dialog */}
        {showConvertDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Převést na spravovaný seznam?
              </h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Tato akce je <strong>nevratná</strong>.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Jako vlastník seznamu uvidíte všechny rezervace u dárků. Toto je vhodné, pokud spravujete seznam pro někoho jiného (např. pro dítě) a potřebujete mít přehled o tom, co kdo koupil.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConvertDialog(false)}
                  className="btn-outline flex-1"
                >
                  Zrušit
                </button>
                <button
                  onClick={handleConvertToManaged}
                  className="btn-primary flex-1"
                >
                  Převést navždy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}