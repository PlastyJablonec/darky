import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Gift, Heart } from 'lucide-react'
import { GiftCard } from '@/components/GiftCard'
import { ShareButtons } from '@/components/ShareButtons'
import { OptimizedImage } from '@/components/OptimizedImage'
import { useAuth } from '@/context/AuthContext'
import { wishlistService } from '@/services/wishlistService'
import { giftService } from '@/services/giftService'
import { ShareService } from '@/services/shareService'
import type { Database } from '@/types'

type Wishlist = Database['public']['Tables']['wishlists']['Row']
type Gift = Database['public']['Tables']['gifts']['Row']

export function SharedWishlist() {
  const { shareId } = useParams<{ shareId: string }>()
  const { user } = useAuth()
  
  const [wishlist, setWishlist] = useState<Wishlist | null>(null)
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    async function fetchSharedWishlist() {
      if (!shareId) return

      try {
        setLoading(true)
        
        // Načíst veřejný seznam
        const wishlistData = await wishlistService.getPublicWishlist(shareId)
        if (!wishlistData) {
          setError('Seznam nebyl nalezen nebo není veřejný')
          return
        }
        
        setWishlist(wishlistData)
        
        // Načíst dárky
        const giftsData = await giftService.getWishlistGifts(wishlistData.id)
        setGifts(giftsData)

        // Sledovat zobrazení
        await ShareService.trackView(wishlistData.id, user?.id)

        // Pokud je uživatel přihlášený, aktualizovat share záznam
        if (user) {
          await ShareService.updateShareView(wishlistData.id, user.id)
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Chyba při načítání')
      } finally {
        setLoading(false)
      }
    }

    fetchSharedWishlist()
  }, [shareId, user])

  const handleReserveGift = async (gift: Gift) => {
    try {
      const updatedGift = await giftService.reserveGift(gift.id, user!.id)
      setGifts(prev => prev.map(g => 
        g.id === gift.id ? updatedGift : g
      ))
    } catch (error) {
      console.error('Error reserving gift:', error)
    }
  }

  const handleUnreserveGift = async (gift: Gift) => {
    try {
      const updatedGift = await giftService.unreserveGift(gift.id)
      setGifts(prev => prev.map(g => 
        g.id === gift.id ? updatedGift : g
      ))
    } catch (error) {
      console.error('Error unreserving gift:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítání seznamu...</p>
        </div>
      </div>
    )
  }

  if (error || !wishlist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Seznam nenalezen
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'Seznam přání nebyl nalezen nebo není veřejně dostupný.'}
          </p>
          <Link
            to="/"
            className="btn-primary"
          >
            Zpět na hlavní stránku
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Gift className="h-8 w-8 text-primary-600" />
              <span className="font-bold text-xl text-gray-900">DárekList</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {!user ? (
                <>
                  <Link to="/login" className="btn-outline">
                    Přihlásit se
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Registrovat se
                  </Link>
                </>
              ) : (
                <Link
                  to="/wishlists"
                  className="flex items-center space-x-1 text-primary-600 hover:text-primary-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Moje seznamy</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                <Heart className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{wishlist.title}</h1>
                {wishlist.description && (
                  <p className="text-gray-600 mt-1">{wishlist.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-center mt-4">
              <ShareButtons
                wishlistTitle={wishlist.title}
                shareUrl={window.location.href}
                onShare={(platform) => console.log('Sdíleno na:', platform)}
              />
            </div>
          </div>

          {wishlist.image_url && (
            <div className="relative h-64 rounded-lg overflow-hidden mx-auto max-w-2xl">
              <OptimizedImage
                src={wishlist.image_url}
                alt={wishlist.title}
                className="w-full h-full"
                aspectRatio={2.5}
              />
            </div>
          )}

          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-blue-800">
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Přihlaste se
                </Link>
                {' '}nebo{' '}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  se registrujte
                </Link>
                {' '}pro rezervaci dárků.
              </p>
            </div>
          )}

          {gifts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Zatím žádné dárky
              </h3>
              <p className="text-gray-600">
                V tomto seznamu zatím nejsou žádné dárky.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {gifts.map((gift) => (
                <GiftCard
                  key={gift.id}
                  gift={gift}
                  isOwner={false}
                  onReserve={handleReserveGift}
                  onUnreserve={handleUnreserveGift}
                />
              ))}
            </div>
          )}
          
          <div className="text-center text-sm text-gray-500 pt-8 border-t">
            <p>Seznam vytvořen pomocí DárekList</p>
            <Link to="/" className="text-primary-600 hover:text-primary-500">
              Vytvořte si vlastní seznam přání
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}