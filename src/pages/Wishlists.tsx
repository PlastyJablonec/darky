import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { WishlistCard } from '@/components/WishlistCard'
import { WishlistModal } from '@/components/WishlistModal'
import { useWishlists } from '@/hooks/useWishlists'
import type { Database } from '@/types'

type Wishlist = Database['public']['Tables']['wishlists']['Row']

export function Wishlists() {
  const {
    wishlists,
    loading,
    error,
    createWishlist,
    updateWishlist,
    deleteWishlist,
    togglePublic,
  } = useWishlists()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWishlist, setEditingWishlist] = useState<Wishlist | null>(null)
  const [deletingWishlist, setDeletingWishlist] = useState<Wishlist | null>(null)

  const handleCreateWishlist = async (data: {
    title: string
    description?: string
    imageUrl?: string
    isPublic?: boolean
    type?: 'personal' | 'managed'
  }) => {
    try {
      await createWishlist(data)
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error creating wishlist:', error)
    }
  }

  const handleUpdateWishlist = async (data: {
    title: string
    description?: string
    imageUrl?: string
    isPublic?: boolean
  }) => {
    if (!editingWishlist) return

    try {
      await updateWishlist(editingWishlist.id, data)
      setEditingWishlist(null)
    } catch (error) {
      console.error('Error updating wishlist:', error)
    }
  }

  const handleDeleteWishlist = async () => {
    if (!deletingWishlist) return

    try {
      await deleteWishlist(deletingWishlist.id)
      setDeletingWishlist(null)
    } catch (error) {
      console.error('Error deleting wishlist:', error)
    }
  }

  const handleTogglePublic = async (wishlist: Wishlist, isPublic: boolean) => {
    try {
      await togglePublic(wishlist.id, isPublic)
    } catch (error) {
      console.error('Error toggling public:', error)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Zkusit znovu
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Moje seznamy přání</h1>
            <p className="text-gray-600 mt-1">
              Spravujte své seznamy přání a sdílejte je s přáteli
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Nový seznam</span>
          </button>
        </div>

        {wishlists.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Zatím nemáte žádné seznamy
              </h3>
              <p className="text-gray-600 mb-6">
                Vytvořte svůj první seznam přání a začněte sdílet své přání s ostatními.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary"
              >
                Vytvořit první seznam
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {wishlists.map((wishlist) => (
              <WishlistCard
                key={wishlist.id}
                wishlist={wishlist}
                onEdit={(wishlist) => setEditingWishlist(wishlist)}
                onDelete={(wishlist) => setDeletingWishlist(wishlist)}
                onTogglePublic={handleTogglePublic}
              />
            ))}
          </div>
        )}

        <WishlistModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateWishlist}
          title="Vytvořit nový seznam"
        />

        <WishlistModal
          isOpen={!!editingWishlist}
          onClose={() => setEditingWishlist(null)}
          onSubmit={handleUpdateWishlist}
          title="Upravit seznam"
          initialData={editingWishlist || undefined}
        />

        {deletingWishlist && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Smazat seznam
              </h3>
              <p className="text-gray-600 mb-6">
                Opravdu chcete smazat seznam "{deletingWishlist.title}"?
                Tato akce je nevratná a smaže také všechny dárky v tomto seznamu.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeletingWishlist(null)}
                  className="btn-outline flex-1"
                >
                  Zrušit
                </button>
                <button
                  onClick={handleDeleteWishlist}
                  className="btn-primary bg-red-600 hover:bg-red-700 flex-1"
                >
                  Smazat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}