import { supabase } from '@/config/supabase'
import type { Contribution, ContributionMessage, GroupGiftSummary } from '@/types'

export class ContributionService {
  // Get all contributions for a gift (only for contributors, not gift owner)
  static async getGiftContributions(giftId: string): Promise<Contribution[]> {
    // First get contributions
    const { data: contributions, error: contributionsError } = await supabase
      .from('gift_contributions')
      .select('*')
      .eq('gift_id', giftId)
      .order('created_at', { ascending: true })

    if (contributionsError) {
      throw new Error(`Failed to fetch contributions: ${contributionsError.message}`)
    }

    if (!contributions || contributions.length === 0) {
      return []
    }

    // Get contributor profiles from profiles table
    const contributorIds = [...new Set(contributions.map(c => c.contributor_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .in('id', contributorIds)

    // Get current user info for fallback
    const { data: { user: currentUser } } = await supabase.auth.getUser()


    // Map contributions with profile data
    return contributions.map(contribution => {
      const profile = profiles?.find(p => p.id === contribution.contributor_id)
      
      // Use profile data first, then fallback to current user metadata if it's current user
      let displayName = profile?.display_name
      let email = profile?.email
      
      // If no profile data and it's current user, use auth metadata
      if (!displayName && currentUser && contribution.contributor_id === currentUser.id) {
        displayName = currentUser.user_metadata?.display_name || currentUser.user_metadata?.full_name
        email = currentUser.email
      }
      
      return {
        id: contribution.id,
        giftId: contribution.gift_id,
        contributorId: contribution.contributor_id,
        contributorName: contribution.is_anonymous 
          ? 'Anonymní přispěvatel' 
          : (displayName || email?.split('@')[0] || 'Přispěvatel'),
        contributorEmail: contribution.is_anonymous ? undefined : email,
        amount: contribution.amount,
        currency: contribution.currency,
        message: contribution.message || undefined,
        isAnonymous: contribution.is_anonymous,
        createdAt: new Date(contribution.created_at),
        updatedAt: new Date(contribution.updated_at)
      }
    })
  }

  // Create a new contribution
  static async createContribution(data: {
    giftId: string
    amount: number
    currency?: string
    message?: string
    isAnonymous?: boolean
  }): Promise<Contribution> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      throw new Error('User must be authenticated to contribute')
    }

    // Check if gift exists and is a group gift
    const { data: gift, error: giftError } = await supabase
      .from('gifts')
      .select('id, is_group_gift, price, wishlist_id, wishlists!inner(user_id)')
      .eq('id', data.giftId)
      .single()

    if (giftError) {
      throw new Error(`Failed to find gift: ${giftError.message}`)
    }

    if (!gift.is_group_gift) {
      throw new Error('This gift is not a group gift')
    }

    // Check if user is not the gift owner
    if ((gift.wishlists as any).user_id === user.user.id) {
      throw new Error('Gift owner cannot contribute to their own gift')
    }

    // Check if gift has a target price
    if (!gift.price || gift.price <= 0) {
      throw new Error('Tento dárek nemá nastavenou cílovou cenu pro skupinové financování')
    }

    // Check if contribution would exceed target price
    const { data: existingContributions } = await supabase
      .from('gift_contributions')
      .select('amount')
      .eq('gift_id', data.giftId)

    const currentTotal = existingContributions?.reduce((sum, c) => sum + c.amount, 0) || 0
    const targetPrice = gift.price

    if (currentTotal + data.amount > targetPrice) {
      throw new Error(`Příspěvek by překročil cílovou částku. Zbývá: ${targetPrice - currentTotal} ${data.currency || 'CZK'}`)
    }

    const { data: newContribution, error } = await supabase
      .from('gift_contributions')
      .insert({
        gift_id: data.giftId,
        contributor_id: user.user.id,
        amount: data.amount,
        currency: data.currency || 'CZK',
        message: data.message,
        is_anonymous: data.isAnonymous || false
      })
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('You have already contributed to this gift. Please update your existing contribution.')
      }
      throw new Error(`Failed to create contribution: ${error.message}`)
    }

    // Get user display name directly from auth (same as Layout component)
    const displayName = user.user.user_metadata?.display_name || user.user.user_metadata?.full_name || user.user.email?.split('@')[0]
    const profile = {
      display_name: displayName,
      email: user.user.email
    }

    return {
      id: newContribution.id,
      giftId: newContribution.gift_id,
      contributorId: newContribution.contributor_id,
      contributorName: newContribution.is_anonymous 
        ? 'Anonymní přispěvatel' 
        : (profile?.display_name || profile?.email?.split('@')[0] || 'Já'),
      contributorEmail: newContribution.is_anonymous ? undefined : profile?.email,
      amount: newContribution.amount,
      currency: newContribution.currency,
      message: newContribution.message || undefined,
      isAnonymous: newContribution.is_anonymous,
      createdAt: new Date(newContribution.created_at),
      updatedAt: new Date(newContribution.updated_at)
    }
  }

  // Update user's own contribution
  static async updateContribution(contributionId: string, data: {
    amount?: number
    message?: string
    isAnonymous?: boolean
  }): Promise<Contribution> {
    // Map isAnonymous to correct database column name
    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    
    if (data.amount !== undefined) updateData.amount = data.amount
    if (data.message !== undefined) updateData.message = data.message
    if (data.isAnonymous !== undefined) updateData.is_anonymous = data.isAnonymous

    const { data: updated, error } = await supabase
      .from('gift_contributions')
      .update(updateData)
      .eq('id', contributionId)
      .select('*')
      .single()

    if (error) {
      throw new Error(`Failed to update contribution: ${error.message}`)
    }

    // Get current user info (updating own contribution)
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const displayName = currentUser?.user_metadata?.display_name || currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0]
    const profile = {
      display_name: displayName,
      email: currentUser?.email
    }

    return {
      id: updated.id,
      giftId: updated.gift_id,
      contributorId: updated.contributor_id,
      contributorName: updated.is_anonymous 
        ? 'Anonymní přispěvatel' 
        : (profile?.display_name || profile?.email?.split('@')[0] || 'Já'),
      contributorEmail: updated.is_anonymous ? undefined : profile?.email,
      amount: updated.amount,
      currency: updated.currency,
      message: updated.message || undefined,
      isAnonymous: updated.is_anonymous,
      createdAt: new Date(updated.created_at),
      updatedAt: new Date(updated.updated_at)
    }
  }

  // Delete user's own contribution
  static async deleteContribution(contributionId: string): Promise<void> {
    const { error } = await supabase
      .from('gift_contributions')
      .delete()
      .eq('id', contributionId)

    if (error) {
      throw new Error(`Failed to delete contribution: ${error.message}`)
    }
  }

  // Get group gift summary with progress info
  static async getGroupGiftSummary(giftId: string): Promise<GroupGiftSummary> {
    // Get gift info
    const { data: gift, error: giftError } = await supabase
      .from('gifts')
      .select('id, price, currency')
      .eq('id', giftId)
      .single()

    if (giftError) {
      throw new Error(`Failed to fetch gift: ${giftError.message}`)
    }

    // Get contributions
    const contributions = await this.getGiftContributions(giftId)
    const totalContributed = contributions.reduce((sum, c) => sum + c.amount, 0)
    const targetAmount = gift.price || 0
    const remainingAmount = Math.max(0, targetAmount - totalContributed)

    return {
      giftId: gift.id,
      targetAmount,
      totalContributed,
      remainingAmount,
      contributorCount: contributions.length,
      isFullyFunded: remainingAmount === 0,
      contributions
    }
  }

  // Get contribution messages for a gift
  static async getContributionMessages(giftId: string): Promise<ContributionMessage[]> {
    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('gift_contribution_messages')
      .select('*')
      .eq('gift_id', giftId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      throw new Error(`Failed to fetch messages: ${messagesError.message}`)
    }

    if (!messages || messages.length === 0) {
      return []
    }

    // Get sender profiles
    const senderIds = [...new Set(messages.map(m => m.sender_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .in('id', senderIds)

    return messages.map(message => {
      const profile = profiles?.find(p => p.id === message.sender_id)
      return {
        id: message.id,
        giftId: message.gift_id,
        senderId: message.sender_id,
        senderName: profile?.display_name || profile?.email?.split('@')[0] || 'Neznámý',
        message: message.message,
        createdAt: new Date(message.created_at)
      }
    })
  }

  // Send a message to other contributors
  static async sendContributionMessage(giftId: string, message: string): Promise<ContributionMessage> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      throw new Error('User must be authenticated to send messages')
    }

    const { data: newMessage, error } = await supabase
      .from('gift_contribution_messages')
      .insert({
        gift_id: giftId,
        sender_id: user.user.id,
        message: message.trim()
      })
      .select('*')
      .single()

    if (error) {
      throw new Error(`Failed to send message: ${error.message}`)
    }

    // Get sender profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, email')
      .eq('id', user.user.id)
      .single()

    return {
      id: newMessage.id,
      giftId: newMessage.gift_id,
      senderId: newMessage.sender_id,
      senderName: profile?.display_name || profile?.email?.split('@')[0] || 'Neznámý',
      message: newMessage.message,
      createdAt: new Date(newMessage.created_at)
    }
  }

  // Check if current user has contributed to a gift
  static async hasUserContributed(giftId: string): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return false

    const { data, error } = await supabase
      .from('gift_contributions')
      .select('id')
      .eq('gift_id', giftId)
      .eq('contributor_id', user.user.id)
      .single()

    return !error && !!data
  }

  // Get user's contribution for a gift
  static async getUserContribution(giftId: string): Promise<Contribution | null> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return null

    const { data, error } = await supabase
      .from('gift_contributions')
      .select('*')
      .eq('gift_id', giftId)
      .eq('contributor_id', user.user.id)
      .single()

    if (error) return null

    // Get profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, email')
      .eq('id', user.user.id)
      .single()

    return {
      id: data.id,
      giftId: data.gift_id,
      contributorId: data.contributor_id,
      contributorName: data.is_anonymous 
        ? 'Anonymní přispěvatel' 
        : (profile?.display_name || profile?.email?.split('@')[0] || 'Neznámý'),
      contributorEmail: data.is_anonymous ? undefined : profile?.email,
      amount: data.amount,
      currency: data.currency,
      message: data.message || undefined,
      isAnonymous: data.is_anonymous,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }
}

export const contributionService = ContributionService