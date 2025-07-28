import { supabase } from '@/config/supabase'
import { giftService } from './giftService'

export interface GiftSuggestion {
  id: string
  giftId: string
  suggestedBy: string
  suggestedByName: string
  createdAt: Date
}

export class SuggestionService {
  // Suggest a gift for group funding
  static async suggestGroupGift(giftId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      throw new Error('User must be authenticated to suggest group gifts')
    }

    // Check if gift exists and is not already a group gift
    const { data: gift, error: giftError } = await supabase
      .from('gifts')
      .select('id, title, price, is_group_gift, wishlist_id, wishlists!inner(user_id, title, is_public)')
      .eq('id', giftId)
      .single()

    if (giftError) {
      throw new Error(`Failed to find gift: ${giftError.message}`)
    }

    if (gift.is_group_gift) {
      throw new Error('This gift is already a group gift')
    }

    if (!(gift.wishlists as any).is_public) {
      throw new Error('Can only suggest group gifts for public wishlists')
    }

    if ((gift.wishlists as any).user_id === user.user.id) {
      throw new Error('Cannot suggest your own gifts for group funding')
    }

    // Create suggestion
    const { error } = await supabase
      .from('group_gift_suggestions')
      .insert({
        gift_id: giftId,
        suggested_by: user.user.id
      })

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('You have already suggested this gift for group funding')
      }
      throw new Error(`Failed to create suggestion: ${error.message}`)
    }

    // Send notification to other users who have access to this wishlist
    await this.notifyUsersAboutSuggestion(gift, user.user)
  }

  // Get suggestion count for a gift
  static async getSuggestionCount(giftId: string): Promise<number> {
    const { data, error } = await supabase
      .from('group_gift_suggestions')
      .select('id')
      .eq('gift_id', giftId)

    if (error) {
      console.warn('Failed to get suggestion count:', error.message)
      return 0
    }

    return data?.length || 0
  }

  // Check if current user has suggested a gift
  static async hasUserSuggested(giftId: string): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return false

    const { data, error } = await supabase
      .from('group_gift_suggestions')
      .select('id')
      .eq('gift_id', giftId)
      .eq('suggested_by', user.user.id)
      .single()

    return !error && !!data
  }

  // Get all suggestions for a gift
  static async getGiftSuggestions(giftId: string): Promise<GiftSuggestion[]> {
    const { data: suggestions, error } = await supabase
      .from('group_gift_suggestions')
      .select('*')
      .eq('gift_id', giftId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch suggestions: ${error.message}`)
    }

    if (!suggestions || suggestions.length === 0) {
      return []
    }

    // Get suggester info
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    return suggestions.map(suggestion => {
      // For privacy, only show names of current user, others show as generic
      const suggestedByName = suggestion.suggested_by === currentUser?.id 
        ? (currentUser?.user_metadata?.display_name || currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Já')
        : 'Někdo z přátel'

      return {
        id: suggestion.id,
        giftId: suggestion.gift_id,
        suggestedBy: suggestion.suggested_by,
        suggestedByName,
        createdAt: new Date(suggestion.created_at)
      }
    })
  }

  // Send notification about suggestion (this would integrate with email service)
  private static async notifyUsersAboutSuggestion(gift: any, suggestedByUser: any): Promise<void> {
    try {
      // In a real app, this would send emails to users who have access to the wishlist
      // For now, we'll just log it
      console.log(`🎁 Group Gift Suggestion:
        Gift: ${gift.title} (${giftService.formatPrice(gift.price, 'CZK')})
        Wishlist: ${gift.wishlists.title}
        Suggested by: ${suggestedByUser.user_metadata?.display_name || suggestedByUser.email}
        
        Email would be sent to users with access to this wishlist asking if they want to contribute.
      `)

      // TODO: Implement actual email notification
      // This would:
      // 1. Get all users who have been shared this wishlist
      // 2. Send them an email with gift details
      // 3. Include a link to contribute to the gift
      // 4. Maybe convert to group gift automatically if enough people are interested

    } catch (error) {
      console.warn('Failed to send notification:', error)
    }
  }

  // Convert gift to group gift when enough people suggest it
  static async convertToGroupGift(giftId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      throw new Error('User must be authenticated')
    }

    // Update the gift to be a group gift
    const { error } = await supabase
      .from('gifts')
      .update({ 
        is_group_gift: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', giftId)

    if (error) {
      throw new Error(`Failed to convert gift to group gift: ${error.message}`)
    }

    console.log(`🎁 Gift converted to group gift based on community suggestions!`)
  }

  // Remove user's suggestion for a gift
  static async removeSuggestion(giftId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      throw new Error('User must be authenticated to remove suggestions')
    }

    const { error } = await supabase
      .from('group_gift_suggestions')
      .delete()
      .eq('gift_id', giftId)
      .eq('suggested_by', user.user.id)

    if (error) {
      throw new Error(`Failed to remove suggestion: ${error.message}`)
    }
  }
}

export const suggestionService = SuggestionService