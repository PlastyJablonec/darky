import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { giftService } from '@/services/giftService'
import { supabase } from '@/config/supabase'
import type { GiftWithReserver } from '@/types'

type Gift = GiftWithReserver

export function useGifts(wishlistId: string | null) {
  const { user } = useAuth()
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!wishlistId || wishlistId === null) {
      setGifts([])
      setLoading(false)
      return
    }

    let mounted = true

    async function fetchGifts() {
      try {
        setLoading(true)
        const data = await giftService.getWishlistGifts(wishlistId!)
        if (mounted) {
          setGifts(data)
          setError(null)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Chyba při načítání dárků')
          console.error('Error fetching gifts:', err)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchGifts()

    const channel = supabase
      .channel(`gifts_changes_${wishlistId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gifts',
          filter: `wishlist_id=eq.${wishlistId}`,
        },
        (payload) => {
          if (!mounted) return

          if (payload.eventType === 'INSERT') {
            setGifts(prev => [payload.new as Gift, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setGifts(prev => prev.map(g =>
              g.id === payload.new.id ? payload.new as Gift : g
            ))
          } else if (payload.eventType === 'DELETE') {
            setGifts(prev => prev.filter(g => g.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [wishlistId])

  const createGift = async (giftData: {
    title: string
    description?: string
    price?: number
    productUrl?: string
    imageUrl?: string
    priority?: 'low' | 'medium' | 'high'
    isGroupGift?: boolean
  }) => {
    if (!wishlistId) throw new Error('Wishlist ID je povinný')

    const newGift = await giftService.createGift({
      wishlist_id: wishlistId,
      title: giftData.title,
      description: giftData.description || null,
      price: giftData.price || null,
      currency: 'CZK',
      product_url: giftData.productUrl || null,
      image_url: giftData.imageUrl || null,
      priority: giftData.priority || 'medium',
      is_group_gift: giftData.isGroupGift || false,
    })

    // Okamžitě přidat do lokálního stavu
    setGifts(prev => [newGift, ...prev])

    return newGift
  }

  const updateGift = async (id: string, updates: {
    title?: string
    description?: string
    price?: number
    productUrl?: string
    imageUrl?: string
    priority?: 'low' | 'medium' | 'high'
    isGroupGift?: boolean
  }) => {
    const updatedGift = await giftService.updateGift(id, {
      title: updates.title,
      description: updates.description || null,
      price: updates.price || null,
      product_url: updates.productUrl || null,
      image_url: updates.imageUrl || null,
      priority: updates.priority,
      is_group_gift: updates.isGroupGift,
    })

    // Okamžitě aktualizovat lokální stav
    setGifts(prev => prev.map(g =>
      g.id === id ? updatedGift : g
    ))

    return updatedGift
  }

  const deleteGift = async (id: string) => {
    await giftService.deleteGift(id)

    // Okamžitě odstranit z lokálního stavu
    setGifts(prev => prev.filter(g => g.id !== id))
  }

  const reserveGift = async (id: string) => {
    if (!user) throw new Error('Musíte být přihlášeni')
    const updatedGift = await giftService.reserveGift(id, user.id)

    // Vytvoříme objekt s profilem rezervujícího změn
    const giftWithProfile: Gift = {
      ...updatedGift,
      reserved_by_profile: {
        display_name: user.user_metadata?.display_name || null,
        email: user.email || null
      }
    }

    // Okamžitě aktualizovat lokální stav
    setGifts(prev => prev.map(g =>
      g.id === id ? giftWithProfile : g
    ))

    return giftWithProfile
  }

  const unreserveGift = async (id: string) => {
    const updatedGift = await giftService.unreserveGift(id)

    // Okamžitě aktualizovat lokální stav
    setGifts(prev => prev.map(g =>
      g.id === id ? { ...updatedGift, reserved_by_profile: undefined } : g
    ))

    return updatedGift
  }

  return {
    gifts,
    loading,
    error,
    createGift,
    updateGift,
    deleteGift,
    reserveGift,
    unreserveGift,
    refresh: () => {
      if (wishlistId) {
        giftService.getWishlistGifts(wishlistId).then(setGifts)
      }
    },
  }
}