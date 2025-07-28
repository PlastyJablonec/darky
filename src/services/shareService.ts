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

  // Získání všech uživatelů s přístupem k wishlistu (pro majitele)
  static async getAccessList(wishlistId: string) {
    try {
      console.log('ShareService.getAccessList called for wishlist:', wishlistId)
      const { data: currentUser } = await supabase.auth.getUser()
      if (!currentUser.user) {
        console.log('No current user found')
        return []
      }
      console.log('Current user:', currentUser.user.id)

      // Kombinujeme shares a views pro kompletní přehled
      const { data: shares, error: sharesError } = await supabase
        .from('wishlist_shares')
        .select('*')
        .eq('wishlist_id', wishlistId)
        .eq('shared_by', currentUser.user.id)

      if (sharesError) {
        console.error('Chyba při získávání shares:', sharesError)
        throw new Error(`Chyba při načítání sdílení: ${sharesError.message}`)
      }
      console.log('Shares found:', shares?.length || 0)

      // Také získáme uživatele, kteří navštívili veřejný odkaz
      const { data: publicViews, error: viewsError } = await supabase
        .from('wishlist_views')
        .select(`
          viewer_id,
          viewed_at,
          first_viewed_at:viewed_at
        `)
        .eq('wishlist_id', wishlistId)
        .not('viewer_id', 'is', null)

      if (viewsError) {
        console.error('Chyba při získávání views:', viewsError)
      }
      console.log('Public views found:', publicViews?.length || 0)

      // Spojíme data z shares a public views
      const accessList: any[] = []

      // Získáme profily pro sdílené uživatele
      let profiles: any[] = []
      if (shares && shares.length > 0) {
        const userIds = shares.map(s => s.shared_with)
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', userIds)
        profiles = profilesData || []
      }

      // Přidáme explicitně sdílené uživatele
      if (shares) {
        for (const share of shares) {
          const profile = profiles.find(p => p.id === share.shared_with)
          accessList.push({
            id: share.id,
            userId: share.shared_with,
            displayName: profile?.display_name || profile?.email?.split('@')[0] || 'Neznámý',
            email: profile?.email,
            accessType: 'shared', // explicitně sdílené
            sharedAt: share.created_at,
            lastViewedAt: share.viewed_at,
            firstViewedAt: share.first_viewed_at,
            canRemove: true
          })
        }
      }

      // Přidáme uživatele z veřejného odkazu (kteří nejsou už v shares)
      if (publicViews) {
        const sharedUserIds = new Set(shares?.map(s => s.shared_with) || [])
        
        for (const view of publicViews) {
          if (!sharedUserIds.has(view.viewer_id)) {
            // Získáme profil uživatele
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name, email')
              .eq('id', view.viewer_id)
              .single()

            accessList.push({
              id: `view-${view.viewer_id}`,
              userId: view.viewer_id,
              displayName: profile?.display_name || profile?.email?.split('@')[0] || 'Neznámý',
              email: profile?.email,
              accessType: 'public', // přišel přes veřejný odkaz
              sharedAt: null,
              lastViewedAt: view.viewed_at,
              firstViewedAt: view.first_viewed_at,
              canRemove: true
            })
          }
        }
      }

      console.log('Final access list:', accessList)
      return accessList
    } catch (err) {
      console.error('Chyba při getAccessList:', err)
      throw err
    }
  }

  // Odebrání přístupu konkrétního uživatele
  static async revokeAccess(wishlistId: string, userId: string) {
    try {
      const { data: currentUser } = await supabase.auth.getUser()
      if (!currentUser.user) {
        throw new Error('Musíte být přihlášen')
      }

      // Smazat ze wishlist_shares (pokud tam je)
      const { error: shareError } = await supabase
        .from('wishlist_shares')
        .delete()
        .eq('wishlist_id', wishlistId)
        .eq('shared_by', currentUser.user.id)
        .eq('shared_with', userId)

      if (shareError) {
        console.error('Chyba při mazání share:', shareError)
      }

      // Poznámka: Views nemažeme, protože slouží i ke statistikám
      // Pouze share záznamy kontrolují přístup

      return true
    } catch (err) {
      console.error('Chyba při revokeAccess:', err)
      throw err
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

  // Kontrola, zda má uživatel přístup k wishlistu
  static async hasAccess(wishlistId: string, userId: string): Promise<boolean> {
    try {
      // Kontrola, zda je seznam veřejný
      const { data: wishlist } = await supabase
        .from('wishlists')
        .select('is_public, user_id')
        .eq('id', wishlistId)
        .single()

      if (!wishlist) return false

      // Vlastník má vždy přístup
      if (wishlist.user_id === userId) return true

      // Pokud není veřejný, zkontrolujeme share záznamy
      if (!wishlist.is_public) {
        const { data: share } = await supabase
          .from('wishlist_shares')
          .select('id')
          .eq('wishlist_id', wishlistId)
          .eq('shared_with', userId)
          .single()

        return !!share
      }

      // Pro veřejné seznamy má každý přístup
      // V budoucnu můžeme přidat "blacklist" funkcionalitu pro odebrané přístupy
      return true

    } catch (error) {
      console.error('Error checking access:', error)
      return false
    }
  }
}