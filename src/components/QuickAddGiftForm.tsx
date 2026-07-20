import { FormEvent, useEffect, useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import type { Database } from '@/types'
import type { LinkPreviewData, QuickAddFormData } from '@/types/quickAdd'
import { normalizeHttpUrl, trimToNull } from '@/utils/urlUtils'

type Wishlist = Database['public']['Tables']['wishlists']['Row']

interface QuickAddGiftFormProps {
  wishlists: Wishlist[]
  initialWishlistId?: string | null
  initialUrl?: string | null
  initialTitle?: string | null
  initialDescription?: string | null
  previewData: LinkPreviewData | null
  isFetchingPreview: boolean
  previewError: string | null
  onFetchPreview: (url: string) => Promise<void>
  onSubmit: (data: QuickAddFormData) => Promise<void>
}

const PRIORITIES: Array<{ value: QuickAddFormData['priority']; label: string }> = [
  { value: 'low', label: 'Nizka' },
  { value: 'medium', label: 'Stredni' },
  { value: 'high', label: 'Vysoka' },
]

function buildInitialWishlistId(wishlists: Wishlist[], initialWishlistId?: string | null): string {
  if (initialWishlistId && wishlists.some(wishlist => wishlist.id === initialWishlistId)) {
    return initialWishlistId
  }

  return wishlists[0]?.id || ''
}

export function QuickAddGiftForm({
  wishlists,
  initialWishlistId,
  initialUrl,
  initialTitle,
  initialDescription,
  previewData,
  isFetchingPreview,
  previewError,
  onFetchPreview,
  onSubmit,
}: QuickAddGiftFormProps) {
  const [formData, setFormData] = useState<QuickAddFormData>({
    wishlistId: buildInitialWishlistId(wishlists, initialWishlistId),
    title: initialTitle?.trim() || '',
    description: initialDescription?.trim() || '',
    price: '',
    productUrl: initialUrl?.trim() || '',
    imageUrl: '',
    priority: 'medium',
    isGroupGift: false,
  })
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      wishlistId: buildInitialWishlistId(wishlists, initialWishlistId),
    }))
  }, [initialWishlistId, wishlists])

  useEffect(() => {
    if (!previewData) {
      return
    }

    setFormData(prev => ({
      ...prev,
      title: prev.title || previewData.title,
      description: prev.description || previewData.description,
      price: prev.price || (previewData.price ? previewData.price.toString() : ''),
      productUrl: prev.productUrl || previewData.productUrl,
      imageUrl: prev.imageUrl || previewData.imageUrl,
    }))
  }, [previewData])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = event.target
    const value = target instanceof HTMLInputElement && target.type === 'checkbox'
      ? String(target.checked)
      : target.value

    setFormData(prev => ({
      ...prev,
      [target.name]: target instanceof HTMLInputElement && target.type === 'checkbox'
        ? target.checked
        : value,
    }))

    if (submitError) {
      setSubmitError(null)
    }
  }

  const handlePreviewSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const normalizedUrl = normalizeHttpUrl(formData.productUrl)
      setFormData(prev => ({ ...prev, productUrl: normalizedUrl }))
      await onFetchPreview(normalizedUrl)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Nepodarilo se pripravit odkaz')
    }
  }

  const handleCreateGift = async () => {
    if (!formData.wishlistId) {
      setSubmitError('Vyberte seznam prani')
      return
    }

    if (!formData.title.trim()) {
      setSubmitError('Nazev darku je povinny')
      return
    }

    let normalizedUrl: string
    try {
      normalizedUrl = normalizeHttpUrl(formData.productUrl)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Neplatna URL')
      return
    }

    if (formData.price && Number.isNaN(Number(formData.price))) {
      setSubmitError('Cena musi byt cislo')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await onSubmit({
        ...formData,
        title: formData.title.trim(),
        description: trimToNull(formData.description) || '',
        productUrl: normalizedUrl,
        imageUrl: trimToNull(formData.imageUrl) || '',
        price: formData.price.trim(),
      })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Nepodarilo se pridat darek')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handlePreviewSubmit} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-gray-900">Quick Add by URL</h2>
          <p className="text-sm text-gray-600">
            Vlozte odkaz z e-shopu nebo sdileni z mobilu. Aplikace zkusi doplnit nazev, obrazek a pripadne cenu.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div>
            <label htmlFor="productUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Odkaz na produkt
            </label>
            <input
              id="productUrl"
              name="productUrl"
              type="url"
              value={formData.productUrl}
              onChange={handleChange}
              className="input"
              placeholder="https://..."
            />
          </div>

          <button
            type="submit"
            className="btn-primary md:self-end flex items-center justify-center gap-2"
            disabled={isFetchingPreview}
          >
            {isFetchingPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>{isFetchingPreview ? 'Nacitam...' : 'Predvyplnit'}</span>
          </button>
        </div>

        {(previewError || submitError) && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {previewError || submitError}
          </div>
        )}

        {previewData && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex gap-4">
              {previewData.imageUrl ? (
                <img
                  src={previewData.imageUrl}
                  alt={previewData.title || 'Preview'}
                  className="h-20 w-20 rounded-lg object-cover border border-gray-200 bg-white"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-primary-700">
                  {previewData.siteName || 'Nacteny odkaz'}
                </p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {previewData.title || 'Bez nazvu'}
                </p>
                {previewData.description ? (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {previewData.description}
                  </p>
                ) : null}
                {previewData.price ? (
                  <p className="mt-2 text-sm font-medium text-gray-800">
                    {previewData.price} {previewData.currency || 'CZK'}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </form>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900">Ulozit do seznamu</h3>
          <p className="text-sm text-gray-600">
            Kdyz metadata nepůjdou nacist, muzete pole rucne dopsat a darek ulozit normalne.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="wishlistId" className="block text-sm font-medium text-gray-700 mb-1">
              Seznam prani
            </label>
            <select
              id="wishlistId"
              name="wishlistId"
              value={formData.wishlistId}
              onChange={handleChange}
              className="input"
            >
              {wishlists.map(wishlist => (
                <option key={wishlist.id} value={wishlist.id}>
                  {wishlist.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priorita
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="input"
            >
              {PRIORITIES.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Nazev darku
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className="input"
            placeholder="Napriklad Nintendo Switch"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Cena
            </label>
            <input
              id="price"
              name="price"
              type="text"
              inputMode="decimal"
              value={formData.price}
              onChange={handleChange}
              className="input"
              placeholder="2999"
            />
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              URL obrazku
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={handleChange}
              className="input"
              placeholder="https://..."
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Poznamka
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="input"
            placeholder="Poznamka k darku, varianta, velikost nebo proc ho chces"
          />
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-gray-200 p-4 cursor-pointer">
          <input
            type="checkbox"
            name="isGroupGift"
            checked={formData.isGroupGift}
            onChange={handleChange}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">
            Oznacit jako skupinovy darek, aby na nej mohlo prispivat vic lidi.
          </span>
        </label>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleCreateGift}
            className="btn-primary min-w-[180px] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting || !wishlists.length}
          >
            {isSubmitting ? 'Ukladam...' : 'Pridat darek'}
          </button>
        </div>
      </div>
    </div>
  )
}
