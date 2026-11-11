import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Gift, Heart } from 'lucide-react'
import { GiftFilters } from '@/components/GiftFilters'
import { useGiftFilters } from '@/hooks/useGiftFilters'
import { SharedOccasions, type OccasionDates } from '@/components/SharedOccasions'
import { ReservationOverview } from '@/components/ReservationOverview'
import { supabase } from '@/config/supabase'
import { managedPersonService } from '@/services/managedPersonService'
import { EnhancedGiftCard } from '@/components/EnhancedGiftCard'
import { ShareButtons } from '@/components/ShareButtons'
import { OptimizedImage } from '@/components/OptimizedImage'
import { AIRecommendations } from '@/components/AIRecommendations'
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
  const [occasions, setOccasions] = useState<OccasionDates | null>(null)
  const filters = useGiftFilters(gifts)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    async function fetchSharedWishlist() {
      if (!shareId) return

      try {
        setLoading(true)
        setOccasions(null)

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

        // Pokud je uživatel přihlášený, zkontrolovat přístup a aktualizovat share záznam
        if (user) {
          const hasAccess = await ShareService.hasAccess(wishlistData.id, user.id)
          if (!hasAccess) {
            setError('Nemáte oprávnění k zobrazení tohoto seznamu')
            return
          }
          await ShareService.updateShareView(wishlistData.id, user.id)
          if (wishlistData.type === 'managed') {
            try {
              const people = await managedPersonService.getMany([wishlistData.id])
              setOccasions(people[0] || null)
            } catch (personError) {
              console.error('Nepodařilo se načíst údaje spravované osoby:', personError)
            }
          } else {
            const { data: dates, error: dateError } = await supabase.from('profile_dates').select('birth_date, name_day').eq('user_id', wishlistData.user_id).maybeSingle()
            if (dateError) console.error('Nepodařilo se načíst důležitá data:', dateError)
            else setOccasions(dates)
          }
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Chyba při načítání')
      } finally {
        setLoading(false)
      }
    }

    fetchSharedWishlist()
  }, [shareId, user])

  useEffect(() => {
    if (!wishlist?.id) return
    let active = true
    const refresh = async () => {
      try {
        const refreshed = await giftService.getWishlistGifts(wishlist.id)
        if (active) setGifts(refreshed)
      } catch (refreshError) {
        console.error('Nepodařilo se aktualizovat přehled dárků:', refreshError)
      }
    }
    const channel = supabase.channel(`shared-gifts-${wishlist.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gifts', filter: `wishlist_id=eq.${wishlist.id}` }, refresh)
      .subscribe((status, subscriptionError) => {
        if (subscriptionError) console.error('Nepodařilo se sledovat změny dárků:', subscriptionError)
        if (status === 'SUBSCRIBED') void refresh()
      })
    window.addEventListener('focus', refresh)
    return () => { active = false; window.removeEventListener('focus', refresh); void supabase.removeChannel(channel) }
  }, [wishlist?.id])

  const activeWishes = filters.filtered

  const receivedGifts = gifts.filter(g => g.is_received)

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
                  <Link to={`/login?returnTo=${encodeURIComponent(`/shared/${shareId}`)}`} className="btn-outline">
                    Přihlásit se
                  </Link>
                  <Link to={`/register?returnTo=${encodeURIComponent(`/shared/${shareId}`)}`} className="btn-primary">
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{wishlist.title}</h1>
                {wishlist.description && (
                  <p className="text-gray-600 mt-1">{wishlist.description}</p>
                )}

              </div>
            </div>

            <div className="max-w-2xl mx-auto space-y-3 mt-6">
              <SharedOccasions dates={occasions} />
              {!user && <p className="text-sm text-gray-500"><Link className="text-primary-600 underline" to={`/login?returnTo=${encodeURIComponent(`/shared/${shareId}`)}`}>Přihlaste se</Link> pro zobrazení narozenin a svátku, pokud je vlastník vyplnil.</p>}
              {(wishlist.type === 'managed' || user?.id !== wishlist.user_id) && <ReservationOverview gifts={gifts} personal={wishlist.type !== 'managed'} />}
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
            <div className="relative h-48 sm:h-64 rounded-lg overflow-hidden mx-auto max-w-2xl">
              <OptimizedImage
                src={wishlist.image_url}
                alt={wishlist.title}
                className="w-full h-full"
                aspectRatio={2.5}
                objectFit="cover"
                clickable={true}
              />
            </div>
          )}

          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-blue-800">
                <Link to={`/login?returnTo=${encodeURIComponent(`/shared/${shareId}`)}`} className="font-medium text-blue-600 hover:text-blue-500">
                  Přihlaste se
                </Link>
                {' '}nebo{' '}
                <Link to={`/register?returnTo=${encodeURIComponent(`/shared/${shareId}`)}`} className="font-medium text-blue-600 hover:text-blue-500">
                  se registrujte
                </Link>
                {' '}pro rezervaci dárků.
              </p>
            </div>
          )}

          {gifts.length > 0 && (
            <AIRecommendations
              wishes={filters.active}
              receivedGifts={receivedGifts}
              occasion={wishlist.occasion}
            />
          )}

          {filters.active.length > 0 && <GiftFilters filters={filters} showAvailability={user?.id !== wishlist.user_id || wishlist.type === 'managed'} />}

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
          ) : activeWishes.length === 0 && filters.active.length > 0 ? (
            <p className="text-center text-gray-600 py-6">Žádný dárek neodpovídá zvoleným filtrům. Zkuste změnit jejich nastavení.</p>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {activeWishes.map((gift) => (
                <EnhancedGiftCard
                  key={gift.id}
                  gift={gift}
                  isOwner={user?.id === wishlist.user_id}
                  showReserved={wishlist.type === 'managed'}
                  onReserve={handleReserveGift}
                  onUnreserve={handleUnreserveGift}
                />
              ))}
            </div>
          )}

          {receivedGifts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-6 opacity-60">
                <Gift className="h-5 w-5 text-gray-400" />
                <h2 className="text-xl font-bold text-gray-700">Archiv obdržených dárků</h2>
              </div>
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 opacity-60">
                {receivedGifts.map((gift) => (
                  <EnhancedGiftCard
                    key={gift.id}
                    gift={gift}
                    isOwner={user?.id === wishlist.user_id}
                    showReserved={false}
                  />
                ))}
              </div>
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