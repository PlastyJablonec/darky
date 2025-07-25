import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Database } from '@/types'

type Wishlist = Database['public']['Tables']['wishlists']['Row']

interface WishlistModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    title: string
    description?: string
    imageUrl?: string
    isPublic?: boolean
  }) => Promise<void>
  title: string
  initialData?: Wishlist
}


export function WishlistModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData,
}: WishlistModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    isPublic: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        imageUrl: initialData.image_url || '',
        isPublic: initialData.is_public,
      })
    } else {
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        isPublic: false,
      })
    }
    setError('')
  }, [initialData, isOpen])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('Název je povinný')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        isPublic: formData.isPublic,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při ukládání')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
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

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Název seznamu *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="input"
              placeholder="Např. Mé narozeniny 2024"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Popis
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="input"
              placeholder="Krátký popis seznamu..."
            />
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              URL obrázku (volitelné)
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="input"
              placeholder="https://example.com/image.jpg"
            />
            <div className="text-xs text-gray-500 mt-1">
              Zadejte URL obrázku pro váš seznam přání
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
              Sdílet veřejně (ostatní mohou tento seznam vidět a rezervovat dárky)
            </label>
          </div>

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
                initialData ? 'Uložit změny' : 'Vytvořit seznam'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}