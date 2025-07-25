import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MoreHorizontal, Share2, Edit, Trash2, Eye } from 'lucide-react'
import { Menu, Transition } from '@headlessui/react'
import { OptimizedImage } from './OptimizedImage'
import { ShareButtons } from './ShareButtons'
import type { Database } from '@/types'

type Wishlist = Database['public']['Tables']['wishlists']['Row']

interface WishlistCardProps {
  wishlist: Wishlist
  onEdit?: (wishlist: Wishlist) => void
  onDelete?: (wishlist: Wishlist) => void
  onTogglePublic?: (wishlist: Wishlist, isPublic: boolean) => void
}

export function WishlistCard({ wishlist, onEdit, onDelete, onTogglePublic }: WishlistCardProps) {
  const [showShareDialog, setShowShareDialog] = useState(false)

  return (
    <Link to={`/wishlists/${wishlist.id}`} className="block">
      <div className="card hover:shadow-md transition-shadow duration-200 cursor-pointer">
        
        <div className="card-header">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="block hover:text-primary-600 transition-colors">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {wishlist.title}
                </h3>
              </div>
              
              {wishlist.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {wishlist.description}
                </p>
              )}
              
              <div className="flex items-center space-x-2">
                {wishlist.is_public && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Share2 className="h-3 w-3 mr-1" />
                    Veřejný
                  </span>
                )}
              </div>
            </div>

            <Menu as="div" className="relative" onClick={(e) => e.preventDefault()}>
              <Menu.Button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </Menu.Button>
            
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to={`/wishlists/${wishlist.id}`}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } flex items-center px-4 py-2 text-sm text-gray-700`}
                      >
                        <Eye className="h-4 w-4 mr-3" />
                        Zobrazit
                      </Link>
                    )}
                  </Menu.Item>
                  
                  {onEdit && (
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onEdit(wishlist)
                          }}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                        >
                          <Edit className="h-4 w-4 mr-3" />
                          Upravit
                        </button>
                      )}
                    </Menu.Item>
                  )}
                  
                  {onTogglePublic && (
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (!wishlist.is_public) {
                              // Pokud není veřejný, udělej ho veřejným a otevři dialog
                              onTogglePublic(wishlist, true)
                              setTimeout(() => setShowShareDialog(true), 100)
                            } else {
                              // Pokud je veřejný, jen otevři dialog
                              setShowShareDialog(true)
                            }
                          }}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                        >
                          <Share2 className="h-4 w-4 mr-3" />
                          {wishlist.is_public ? 'Sdílet seznam' : 'Sdílet'}
                        </button>
                      )}
                    </Menu.Item>
                  )}
                  
                  {wishlist.is_public && onTogglePublic && (
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onTogglePublic(wishlist, false)
                          }}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                        >
                          <Share2 className="h-4 w-4 mr-3" />
                          Zrušit sdílení
                        </button>
                      )}
                    </Menu.Item>
                  )}
                  
                  
                  {onDelete && (
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onDelete(wishlist)
                          }}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } flex items-center w-full px-4 py-2 text-sm text-red-600`}
                        >
                          <Trash2 className="h-4 w-4 mr-3" />
                          Smazat
                        </button>
                      )}
                    </Menu.Item>
                  )}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
        </div>
        
        {wishlist.image_url && (
          <div className="px-6">
            <div className="relative">
              <OptimizedImage
                src={wishlist.image_url}
                alt={wishlist.title}
                className="w-full h-32 rounded-md"
                aspectRatio={2.5}
              />
            </div>
          </div>
        )}
        
        <div className="card-footer">
          <div className="text-xs text-gray-500">
            Vytvořeno {new Date(wishlist.created_at).toLocaleDateString('cs-CZ')}
          </div>
        </div>
      </div>
      
      {/* Share Dialog */}
      {wishlist.is_public && (
        <div onClick={(e) => e.preventDefault()}>
          <ShareButtons
            wishlistTitle={wishlist.title}
            shareUrl={wishlist.share_id ? `${window.location.origin}/shared/${wishlist.share_id}` : window.location.href}
            onShare={(platform) => console.log('Sdíleno na:', platform)}
            showDialog={showShareDialog}
            onCloseDialog={() => setShowShareDialog(false)}
          />
        </div>
      )}
    </Link>
  )
}