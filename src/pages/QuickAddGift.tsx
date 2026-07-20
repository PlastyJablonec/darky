import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Share2 } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { QuickAddGiftForm } from '@/components/QuickAddGiftForm'
import { useAuth } from '@/context/AuthContext'
import { giftService } from '@/services/giftService'
import { linkPreviewService } from '@/services/linkPreviewService'
import { wishlistService } from '@/services/wishlistService'
import type { Database } from '@/types'
import type { LinkPreviewData, QuickAddFormData } from '@/types/quickAdd'
import { debugError } from '@/utils/debug'
import { extractUrlFromText } from '@/utils/urlUtils'

type Wishlist = Database['public']['Tables']['wishlists']['Row']

function buildInitialUrl(searchParams: URLSearchParams): string {
  const directUrl = searchParams.get('url')
  if (directUrl) {
    return directUrl
  }

  const textValue = searchParams.get('text')
  if (!textValue) {
    return ''
  }

  return extractUrlFromText(textValue) || ''
}

function buildInitialDescription(searchParams: URLSearchParams, initialUrl: string): string {
  const textValue = searchParams.get('text')?.trim()
  if (!textValue) {
    return ''
  }

  if (initialUrl) {
    return textValue.replace(initialUrl, '').trim()
  }

  return textValue
}

export function QuickAddGift() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [wishlists, setWishlists] = useState<Wishlist[]>([])
  const [previewData, setPreviewData] = useState<LinkPreviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [isFetchingPreview, setIsFetchingPreview] = useState(false)

  const initialUrl = buildInitialUrl(searchParams)
  const initialTitle = searchParams.get('title')?.trim() || ''
  const initialDescription = buildInitialDescription(searchParams, initialUrl)
  const initialWishlistId = searchParams.get('wishlistId')

  useEffect(() => {
    async function loadWishlists() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const data = await wishlistService.getUserWishlists(user.id)
        setWishlists(data)
      } catch (error) {
        debugError('Failed to load wishlists for quick add', error)
        setPageError('Nepodarilo se nacist vase seznamy prani')
      } finally {
        setLoading(false)
      }
    }

    loadWishlists()
  }, [user])

  useEffect(() => {
    if (!initialUrl) {
      return
    }

    setIsFetchingPreview(true)
    setPreviewError(null)

    linkPreviewService.fetchPreview(initialUrl)
      .then(data => {
        setPreviewData(data)
      })
      .catch(error => {
        debugError('Quick add preview fetch failed', error)
        setPreviewError(error instanceof Error ? error.message : 'Metadata odkazu se nepodarilo nacist')
      })
      .finally(() => {
        setIsFetchingPreview(false)
      })
  }, [initialUrl])

  const handleFetchPreview = async (url: string) => {
    setPreviewError(null)
    setIsFetchingPreview(true)

    try {
      const data = await linkPreviewService.fetchPreview(url)
      setPreviewData(data)
    } catch (error) {
      debugError('Quick add preview fetch failed', error)
      setPreviewError(error instanceof Error ? error.message : 'Metadata odkazu se nepodarilo nacist')
    } finally {
      setIsFetchingPreview(false)
    }
  }

  const handleSubmit = async (data: QuickAddFormData) => {
    await giftService.createGift({
      wishlist_id: data.wishlistId,
      title: data.title,
      description: data.description || null,
      price: data.price ? Number(data.price) : null,
      currency: 'CZK',
      product_url: data.productUrl || null,
      image_url: data.imageUrl || null,
      priority: data.priority,
      is_group_gift: data.isGroupGift,
    })

    navigate(`/wishlists/${data.wishlistId}?added=quick`, { replace: true })
  }

  if (!user) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <h1 className="text-xl font-semibold">Pro rychle pridani darku se nejdriv prihlas</h1>
          <p className="mt-2 text-sm">
            Po prihlaseni se sem muzes vratit a darek ulozit do sveho seznamu.
          </p>
          <Link to="/login?returnTo=/quick-add" className="btn-primary mt-4 inline-flex">
            Prihlasit se
          </Link>
        </div>
      </Layout>
    )
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  if (pageError) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p>{pageError}</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/wishlists"
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rychle pridat darek</h1>
              <p className="mt-1 text-gray-600">
                Funguje pro zkopirovany odkaz i pro mobilni sdileni z prohlizece, Telegramu nebo WhatsAppu.
              </p>
            </div>
          </div>

          <div className="hidden rounded-xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-800 md:flex md:items-center md:gap-2">
            <Share2 className="h-4 w-4" />
            <span>Share target je pripraveny pro mobilni PWA instalaci.</span>
          </div>
        </div>

        {wishlists.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Nejdriv potrebujes seznam prani</h2>
            <p className="mt-2 text-sm text-gray-600">
              Vytvor aspon jeden seznam a potom do nej muzes darky pridavat pres odkazy a mobilni sdileni.
            </p>
            <Link to="/wishlists" className="btn-primary mt-4 inline-flex">
              Otevrit moje seznamy
            </Link>
          </div>
        ) : (
          <QuickAddGiftForm
            wishlists={wishlists}
            initialWishlistId={initialWishlistId}
            initialUrl={initialUrl}
            initialTitle={initialTitle}
            initialDescription={initialDescription}
            previewData={previewData}
            isFetchingPreview={isFetchingPreview}
            previewError={previewError}
            onFetchPreview={handleFetchPreview}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </Layout>
  )
}
