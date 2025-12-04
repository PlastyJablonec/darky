import { supabase } from '@/config/supabase'
import { debugError } from '@/utils/debug'
import type { Database } from '@/types'

type Wishlist = Database['public']['Tables']['wishlists']['Row']
type WishlistInsert = Database['public']['Tables']['wishlists']['Insert']
type WishlistUpdate = Database['public']['Tables']['wishlists']['Update']

export const wishlistService = {
  async getUserWishlists(userId: string): Promise<Wishlist[]> {
    const { data, error } = await supabase
      .from('wishlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      debugError('Chyba při načítání seznamů přání', error)
      throw error
    }
    return data || []
  },

  async getWishlist(id: string): Promise<Wishlist | null> {
    const { data, error } = await supabase
      .from('wishlists')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },

  async getPublicWishlist(shareId: string): Promise<Wishlist | null> {
    const { data, error } = await supabase
      .from('wishlists')
      .select('*')
      .eq('share_id', shareId)
      .eq('is_public', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },

  async createWishlist(wishlist: WishlistInsert): Promise<Wishlist> {
    const { data, error } = await supabase
      .from('wishlists')
      .insert(wishlist)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateWishlist(id: string, updates: WishlistUpdate): Promise<Wishlist> {
    const { data, error } = await supabase
      .from('wishlists')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteWishlist(id: string): Promise<void> {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  generateShareId(): string {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
  },

  async togglePublic(id: string, isPublic: boolean): Promise<Wishlist> {
    const updates: WishlistUpdate = {
      is_public: isPublic,
      updated_at: new Date().toISOString(),
    }

    if (isPublic && !updates.share_id) {
      updates.share_id = this.generateShareId()
    }

    const { data, error } = await supabase
      .from('wishlists')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateWishlistType(id: string, type: 'personal' | 'managed'): Promise<Wishlist> {
    const { data, error } = await supabase
      .from('wishlists')
      .update({ type, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}