import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Share2, Eye, Users } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { GiftCard } from '@/components/GiftCard'
import { GiftModal } from '@/components/GiftModal'
import { ShareButtons } from '@/components/ShareButtons'
import { OptimizedImage } from '@/components/OptimizedImage'
import { useAuth } from '@/context/AuthContext'
import { useGifts } from '@/hooks/useGifts'
import { wishlistService } from '@/services/wishlistService'
import { ShareService } from '@/services/shareService'
import type { Database } from '@/types'

type Wishlist = Database['public']['Tables']['wishlists']['Row']
type Gift = Database['public']['Tables']['gifts']['Row']

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

  const isOwner = wishlist?.user_id === user?.id

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

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/wishlists"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{wishlist.title}</h1>
              {wishlist.description && (
                <p className="text-gray-600 mt-1">{wishlist.description}</p>
              )}
              <div className="flex items-center space-x-2 mt-2">
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

          <div className="flex items-center space-x-3">
            {wishlist.is_public && wishlist.share_id && (
              <ShareButtons
                wishlistTitle={wishlist.title}
                shareUrl={`${window.location.origin}/shared/${wishlist.share_id}`}
                userName={user?.user_metadata?.display_name || user?.email}
                onShare={(platform) => console.log('Sdíleno na:', platform)}
              />
            )}
            
            {isOwner && (
              <button
                onClick={() => setIsGiftModalOpen(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Přidat dárek</span>
              </button>
            )}
          </div>
        </div>

        {wishlist.image_url && (
          <div className="relative h-64 rounded-lg overflow-hidden">
            <OptimizedImage
              src={wishlist.image_url}
              alt={wishlist.title}
              className="w-full h-full"
              aspectRatio={2.5}
              objectFit="contain"
            />
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {gifts.map((gift) => (
              <GiftCard
                key={gift.id}
                gift={gift}
                isOwner={isOwner}
                onEdit={(gift) => setEditingGift(gift)}
                onDelete={(gift) => setDeletingGift(gift)}
                onReserve={handleReserveGift}
                onUnreserve={handleUnreserveGift}
              />
            ))}
          </div>
        )}

        <GiftModal
          isOpen={isGiftModalOpen}
          onClose={() => setIsGiftModalOpen(false)}
          onSubmit={handleCreateGift}
          title="Přidat nový dárek"
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
      </div>
    </Layout>
  )
}