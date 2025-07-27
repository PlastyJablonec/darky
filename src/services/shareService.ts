import { supabase } from '@/config/supabase'

export class ShareService {
  // Sledování zobrazení sdíleného seznamu
  static async trackView(wishlistId: string, userId?: string) {
    try {
      const viewData: any = {
        wishlist_id: wishlistId,
        viewer_id: userId || null,
        viewed_at: new Date().toISOString()
      }

      // Pro anonymní uživatele přidat info o prohlížeči
      if (!userId && typeof window !== 'undefined') {
        viewData.viewer_info = {
          userAgent: navigator.userAgent,
          // IP adresu můžeme získat později serverside
        }
      }

      const { error } = await supabase
        .from('wishlist_views')
        .insert(viewData)

      if (error) {
        console.error('Chyba při sledování zobrazení:', error)
      }
    } catch (err) {
      console.error('Chyba při trackView:', err)
    }
  }

  // Vytvoření záznamu o sdílení (kdy vlastník sdílí seznam s konkrétním uživatelem)
  static async createShare(wishlistId: string, sharedWith: string) {
    try {
      const { data: currentUser } = await supabase.auth.getUser()
      if (!currentUser.user) return null

      const { data, error } = await supabase
        .from('wishlist_shares')
        .insert({
          wishlist_id: wishlistId,
          shared_by: currentUser.user.id,
          shared_with: sharedWith
        })
        .select()
        .single()

      if (error) {
        console.error('Chyba při vytváření share:', error)
        return null
      }

      return data
    } catch (err) {
      console.error('Chyba při createShare:', err)
      return null
    }
  }

  // Aktualizace kdy uživatel poprvé/naposledy viděl sdílený seznam
  static async updateShareView(wishlistId: string, viewerId: string) {
    try {
      // Najít existující share záznam
      const { data: existingShare } = await supabase
        .from('wishlist_shares')
        .select()
        .eq('wishlist_id', wishlistId)
        .eq('shared_with', viewerId)
        .single()

      if (existingShare) {
        // Aktualizovat existující záznam
        const updates: any = {
          viewed_at: new Date().toISOString()
        }

        // Pokud je to první zobrazení, nastavit i first_viewed_at
        if (!existingShare.first_viewed_at) {
          updates.first_viewed_at = updates.viewed_at
        }

        const { error } = await supabase
          .from('wishlist_shares')
          .update(updates)
          .eq('id', existingShare.id)

        if (error) {
          console.error('Chyba při aktualizaci share view:', error)
        }
      } else {
        // Vytvořit nový share záznam - když někdo navštíví veřejný odkaz
        const { data: wishlist } = await supabase
          .from('wishlists')
          .select('user_id')
          .eq('id', wishlistId)
          .single()

        if (wishlist && wishlist.user_id !== viewerId) {
          // Přidat do "Sdíleno se mnou" pouze pokud to není vlastník
          const now = new Date().toISOString()
          const { error } = await supabase
            .from('wishlist_shares')
            .insert({
              wishlist_id: wishlistId,
              shared_by: wishlist.user_id,
              shared_with: viewerId,
              viewed_at: now,
              first_viewed_at: now
            })

          // Ignorovat chybu duplicate key - to je v pořádku
          if (error && !error.message?.includes('duplicate') && !error.message?.includes('unique')) {
            console.error('Chyba při vytváření share záznamu:', error)
          }
        }
      }
    } catch (err) {
      console.error('Chyba při updateShareView:', err)
    }
  }

  // Získání seznamů sdílených se mnou
  static async getSharedWithMe(userId: string) {
    try {
      const { data, error } = await supabase
        .from('wishlist_shares')
        .select(`
          *,
          wishlist:wishlist_id (
            id,
            title,
            description,
            image_url,
            occasion,
            share_id,
            created_at,
            user_id
          )
        `)
        .eq('shared_with', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Chyba při získávání shared lists:', error)
        return []
      }

      // Transformovat data do očekávaného formátu
      const transformedData = (data || []).map(share => ({
        ...share,
        wishlists: {
          ...share.wishlist,
          users: {
            id: share.wishlist?.user_id,
            email: `user-${share.wishlist?.user_id?.slice(0, 8)}`, // Placeholder
            raw_user_meta_data: {}
          }
        }
      }))

      return transformedData
    } catch (err) {
      console.error('Chyba při getSharedWithMe:', err)
      return []
    }
  }

  // Získání informací o sdílení pro vlastníka seznamu
  static async getShareInfo(wishlistId: string) {
    try {
      const { data: currentUser } = await supabase.auth.getUser()
      if (!currentUser.user) return null

      // Získat všechny shares
      const { data: shares, error: sharesError } = await supabase
        .from('wishlist_shares')
        .select('*')
        .eq('wishlist_id', wishlistId)
        .eq('shared_by', currentUser.user.id)

      if (sharesError) {
        console.error('Chyba při získávání shares:', sharesError)
      }

      // Získat všechny views
      const { data: views, error: viewsError } = await supabase
        .from('wishlist_views')
        .select('*')
        .eq('wishlist_id', wishlistId)
        .order('viewed_at', { ascending: false })

      if (viewsError) {
        console.error('Chyba při získávání views:', viewsError)
      }

      return {
        shares: shares || [],
        views: views || [],
        totalViews: views?.length || 0,
        uniqueViewers: views ? new Set(views.map(v => v.viewer_id).filter(Boolean)).size : 0
      }
    } catch (err) {
      console.error('Chyba při getShareInfo:', err)
      return null
    }
  }

  // Smazání share záznamu
  static async removeShare(shareId: string) {
    try {
      const { error } = await supabase
        .from('wishlist_shares')
        .delete()
        .eq('id', shareId)

      if (error) {
        console.error('Chyba při mazání share:', error)
        return false
      }

      return true
    } catch (err) {
      console.error('Chyba při removeShare:', err)
      return false  
    }
  }

  // Získání statistik zobrazení pro dashboard
  static async getViewStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('wishlist_views')
        .select(`
          *,
          wishlists:wishlist_id!inner (
            id,
            title,
            user_id
          )
        `)
        .eq('wishlists.user_id', userId)
        .order('viewed_at', { ascending: false })

      if (error) {
        console.error('Chyba při získávání view stats:', error)
        return []
      }

      return data || []
    } catch (err) {
      console.error('Chyba při getViewStats:', err)
      return []
    }
  }
}