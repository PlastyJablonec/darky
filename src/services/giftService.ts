import { supabase } from '@/config/supabase'
import type { Database } from '@/types'

type Gift = Database['public']['Tables']['gifts']['Row']
type GiftInsert = Database['public']['Tables']['gifts']['Insert']
type GiftUpdate = Database['public']['Tables']['gifts']['Update']

export const giftService = {
  async getWishlistGifts(wishlistId: string): Promise<Gift[]> {
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .eq('wishlist_id', wishlistId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getGift(id: string): Promise<Gift | null> {
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },

  async createGift(gift: GiftInsert): Promise<Gift> {
    const { data, error } = await supabase
      .from('gifts')
      .insert(gift)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateGift(id: string, updates: GiftUpdate): Promise<Gift> {
    const { data, error } = await supabase
      .from('gifts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteGift(id: string): Promise<void> {
    const { error } = await supabase
      .from('gifts')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async reserveGift(id: string, userId: string): Promise<Gift> {
    const { data, error } = await supabase
      .from('gifts')
      .update({
        is_reserved: true,
        reserved_by: userId,
        reserved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async unreserveGift(id: string): Promise<Gift> {
    const { data, error } = await supabase
      .from('gifts')
      .update({
        is_reserved: false,
        reserved_by: null,
        reserved_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  formatPrice(price: number | null, currency: string = 'CZK'): string {
    if (!price) return 'Bez ceny'
    
    const formatter = new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: currency,
    })
    
    return formatter.format(price)
  },

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'low':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  },

  getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'high':
        return 'Vysoká'
      case 'medium':
        return 'Střední'
      case 'low':
        return 'Nízká'
      default:
        return 'Neznámá'
    }
  },
}