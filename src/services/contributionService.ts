import { supabase } from '@/config/supabase'
import type { Contribution, ContributionMessage, GroupGiftSummary } from '@/types'

export class ContributionService {
  // Get all contributions for a gift (only for contributors, not gift owner)
  static async getGiftContributions(giftId: string): Promise<Contribution[]> {
    const { data, error } = await supabase
      .from('gift_contributions')
      .select(`
        *,
        profiles:contributor_id (
          display_name,
          email
        )
      `)
      .eq('gift_id', giftId)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch contributions: ${error.message}`)
    }

    return data.map(contribution => ({
      id: contribution.id,
      giftId: contribution.gift_id,
      contributorId: contribution.contributor_id,
      contributorName: contribution.is_anonymous 
        ? 'Anonymní přispěvatel' 
        : (contribution.profiles?.display_name || contribution.profiles?.email?.split('@')[0] || 'Neznámý'),
      contributorEmail: contribution.is_anonymous ? undefined : contribution.profiles?.email,
      amount: contribution.amount,
      currency: contribution.currency,
      message: contribution.message || undefined,
      isAnonymous: contribution.is_anonymous,
      createdAt: new Date(contribution.created_at),
      updatedAt: new Date(contribution.updated_at)
    }))
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
    if (gift.wishlists.user_id === user.user.id) {
      throw new Error('Gift owner cannot contribute to their own gift')
    }

    // Check if contribution would exceed target price
    const { data: existingContributions } = await supabase
      .from('gift_contributions')
      .select('amount')
      .eq('gift_id', data.giftId)

    const currentTotal = existingContributions?.reduce((sum, c) => sum + c.amount, 0) || 0
    const targetPrice = gift.price || 0

    if (currentTotal + data.amount > targetPrice) {
      throw new Error(`Contribution would exceed target price. Remaining: ${targetPrice - currentTotal} ${data.currency || 'CZK'}`)
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
      .select(`
        *,
        profiles:contributor_id (
          display_name,
          email
        )
      `)
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('You have already contributed to this gift. Please update your existing contribution.')
      }
      throw new Error(`Failed to create contribution: ${error.message}`)
    }

    return {
      id: newContribution.id,
      giftId: newContribution.gift_id,
      contributorId: newContribution.contributor_id,
      contributorName: newContribution.is_anonymous 
        ? 'Anonymní přispěvatel' 
        : (newContribution.profiles?.display_name || newContribution.profiles?.email?.split('@')[0] || 'Neznámý'),
      contributorEmail: newContribution.is_anonymous ? undefined : newContribution.profiles?.email,
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
    const { data: updated, error } = await supabase
      .from('gift_contributions')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', contributionId)
      .select(`
        *,
        profiles:contributor_id (
          display_name,
          email
        )
      `)
      .single()

    if (error) {
      throw new Error(`Failed to update contribution: ${error.message}`)
    }

    return {
      id: updated.id,
      giftId: updated.gift_id,
      contributorId: updated.contributor_id,
      contributorName: updated.is_anonymous 
        ? 'Anonymní přispěvatel' 
        : (updated.profiles?.display_name || updated.profiles?.email?.split('@')[0] || 'Neznámý'),
      contributorEmail: updated.is_anonymous ? undefined : updated.profiles?.email,
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
    const { data, error } = await supabase
      .from('gift_contribution_messages')
      .select(`
        *,
        profiles:sender_id (
          display_name,
          email
        )
      `)
      .eq('gift_id', giftId)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`)
    }

    return data.map(message => ({
      id: message.id,
      giftId: message.gift_id,
      senderId: message.sender_id,
      senderName: message.profiles?.display_name || message.profiles?.email?.split('@')[0] || 'Neznámý',
      message: message.message,
      createdAt: new Date(message.created_at)
    }))
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
      .select(`
        *,
        profiles:sender_id (
          display_name,
          email
        )
      `)
      .single()

    if (error) {
      throw new Error(`Failed to send message: ${error.message}`)
    }

    return {
      id: newMessage.id,
      giftId: newMessage.gift_id,
      senderId: newMessage.sender_id,
      senderName: newMessage.profiles?.display_name || newMessage.profiles?.email?.split('@')[0] || 'Neznámý',
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
      .select(`
        *,
        profiles:contributor_id (
          display_name,
          email
        )
      `)
      .eq('gift_id', giftId)
      .eq('contributor_id', user.user.id)
      .single()

    if (error) return null

    return {
      id: data.id,
      giftId: data.gift_id,
      contributorId: data.contributor_id,
      contributorName: data.is_anonymous 
        ? 'Anonymní přispěvatel' 
        : (data.profiles?.display_name || data.profiles?.email?.split('@')[0] || 'Neznámý'),
      contributorEmail: data.is_anonymous ? undefined : data.profiles?.email,
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