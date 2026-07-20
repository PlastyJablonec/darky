export interface LinkPreviewData {
  title: string
  description: string
  imageUrl: string
  productUrl: string
  siteName: string
  price: number | null
  currency: string | null
}

export interface QuickAddFormData {
  wishlistId: string
  title: string
  description: string
  price: string
  productUrl: string
  imageUrl: string
  priority: 'low' | 'medium' | 'high'
  isGroupGift: boolean
}
