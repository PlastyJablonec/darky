import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Database } from '@/types'

type Gift = Database['public']['Tables']['gifts']['Row']

interface GiftModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    title: string
    description?: string
    price?: number
    productUrl?: string
    imageUrl?: string
    priority?: 'low' | 'medium' | 'high'
    isGroupGift?: boolean
  }) => Promise<void>
  title: string
  initialData?: Gift
}

const PRIORITIES = [
  { value: 'low', label: 'Nízká' },
  { value: 'medium', label: 'Střední' },
  { value: 'high', label: 'Vysoká' },
]

export function GiftModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData,
}: GiftModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    productUrl: '',
    imageUrl: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    isGroupGift: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        price: initialData.price?.toString() || '',
        productUrl: initialData.product_url || '',
        imageUrl: initialData.image_url || '',
        priority: initialData.priority as 'low' | 'medium' | 'high',
        isGroupGift: initialData.is_group_gift,
      })
    } else {
      setFormData({
        title: '',
        description: '',
        price: '',
        productUrl: '',
        imageUrl: '',
        priority: 'medium',
        isGroupGift: false,
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

    const price = formData.price ? parseFloat(formData.price) : undefined
    if (formData.price && (isNaN(price!) || price! < 0)) {
      setError('Cena musí být kladné číslo')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        price,
        productUrl: formData.productUrl.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        priority: formData.priority,
        isGroupGift: formData.isGroupGift,
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
              Název dárku *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="input"
              placeholder="Např. iPhone 15"
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
              placeholder="Podrobný popis dárku..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Cena (Kč)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="input"
                placeholder="25000"
              />
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
                {PRIORITIES.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="productUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Odkaz na produkt
            </label>
            <input
              type="url"
              id="productUrl"
              name="productUrl"
              value={formData.productUrl}
              onChange={handleChange}
              className="input"
              placeholder="https://alza.cz/produkt"
            />
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              URL obrázku
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
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isGroupGift"
              name="isGroupGift"
              checked={formData.isGroupGift}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isGroupGift" className="ml-2 block text-sm text-gray-700">
              Skupinový dárek (více lidí může přispět)
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
                initialData ? 'Uložit změny' : 'Přidat dárek'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}