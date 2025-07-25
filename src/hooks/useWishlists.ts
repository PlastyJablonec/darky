import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { wishlistService } from '@/services/wishlistService'
import { supabase } from '@/config/supabase'
import type { Database } from '@/types'

type Wishlist = Database['public']['Tables']['wishlists']['Row']

export function useWishlists() {
  const { user } = useAuth()
  const [wishlists, setWishlists] = useState<Wishlist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setWishlists([])
      setLoading(false)
      return
    }

    let mounted = true

    async function fetchWishlists() {
      try {
        setLoading(true)
        const data = await wishlistService.getUserWishlists(user!.id)
        if (mounted) {
          setWishlists(data)
          setError(null)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Chyba při načítání')
          console.error('Error fetching wishlists:', err)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchWishlists()

    const channel = supabase
      .channel('wishlists_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wishlists',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (!mounted) return

          if (payload.eventType === 'INSERT') {
            setWishlists(prev => [payload.new as Wishlist, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setWishlists(prev => prev.map(w => 
              w.id === payload.new.id ? payload.new as Wishlist : w
            ))
          } else if (payload.eventType === 'DELETE') {
            setWishlists(prev => prev.filter(w => w.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [user])

  const createWishlist = async (wishlistData: {
    title: string
    description?: string
    imageUrl?: string
    isPublic?: boolean
  }) => {
    if (!user) throw new Error('Musíte být přihlášeni')

    const newWishlist = await wishlistService.createWishlist({
      user_id: user.id,
      title: wishlistData.title,
      description: wishlistData.description || null,
      image_url: wishlistData.imageUrl || null,
      is_public: wishlistData.isPublic || false,
      share_id: wishlistData.isPublic ? wishlistService.generateShareId() : null,
    })

    // Okamžitě přidat do lokálního stavu
    setWishlists(prev => [newWishlist, ...prev])

    return newWishlist
  }

  const updateWishlist = async (id: string, updates: {
    title?: string
    description?: string
    imageUrl?: string
    isPublic?: boolean
  }) => {
    const updatedWishlist = await wishlistService.updateWishlist(id, {
      title: updates.title,
      description: updates.description || null,
      image_url: updates.imageUrl || null,
      is_public: updates.isPublic,
    })

    // Okamžitě aktualizovat lokální stav
    setWishlists(prev => prev.map(w => 
      w.id === id ? updatedWishlist : w
    ))

    return updatedWishlist
  }

  const deleteWishlist = async (id: string) => {
    await wishlistService.deleteWishlist(id)
    
    // Okamžitě odstranit z lokálního stavu
    setWishlists(prev => prev.filter(w => w.id !== id))
  }

  const togglePublic = async (id: string, isPublic: boolean) => {
    const updatedWishlist = await wishlistService.togglePublic(id, isPublic)
    
    // Okamžitě aktualizovat lokální stav
    setWishlists(prev => prev.map(w => 
      w.id === id ? updatedWishlist : w
    ))
    
    return updatedWishlist
  }

  return {
    wishlists,
    loading,
    error,
    createWishlist,
    updateWishlist,
    deleteWishlist,
    togglePublic,
    refresh: () => {
      if (user) {
        wishlistService.getUserWishlists(user.id).then(setWishlists)
      }
    },
  }
}