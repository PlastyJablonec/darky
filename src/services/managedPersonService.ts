import { supabase } from '@/config/supabase'
import type { ManagedPerson } from '@/types'

export const managedPersonService = {
  async getMany(ids: string[]): Promise<ManagedPerson[]> {
    if (!ids.length) return []
    const { data, error } = await supabase.from('managed_wishlist_people').select('*').in('wishlist_id', ids)
    if (error) throw error
    return data || []
  },
  async save(person: ManagedPerson): Promise<void> {
    const { error } = await supabase.from('managed_wishlist_people').upsert(person)
    if (error) throw error
  },
}
