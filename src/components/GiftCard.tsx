import { useState } from 'react'
import { MoreHorizontal, Edit, Trash2, ExternalLink, ShoppingCart, Users, Lock } from 'lucide-react'
import { Menu, Transition } from '@headlessui/react'
import { useAuth } from '@/context/AuthContext'
import { giftService } from '@/services/giftService'
import { AuthDialog } from './AuthDialog'
import type { Database } from '@/types'

type Gift = Database['public']['Tables']['gifts']['Row']

interface GiftCardProps {
  gift: Gift
  isOwner: boolean
  onEdit?: (gift: Gift) => void
  onDelete?: (gift: Gift) => void
  onReserve?: (gift: Gift) => void
  onUnreserve?: (gift: Gift) => void
}

export function GiftCard({ 
  gift, 
  isOwner, 
  onEdit, 
  onDelete, 
  onReserve, 
  onUnreserve 
}: GiftCardProps) {
  const { user } = useAuth()
  const [imageError, setImageError] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authAction, setAuthAction] = useState('')

  const isReservedByCurrentUser = gift.reserved_by === user?.id
  const canReserve = !isOwner && !gift.is_reserved
  const canUnreserve = !isOwner && isReservedByCurrentUser

  const handleImageError = () => {
    setImageError(true)
  }

  const formatPrice = (price: number | null, currency: string) => {
    return giftService.formatPrice(price, currency)
  }

  const getPriorityColor = (priority: string) => {
    return giftService.getPriorityColor(priority)
  }

  const getPriorityLabel = (priority: string) => {
    return giftService.getPriorityLabel(priority)
  }

  const handleAuthAction = (action: string, callback: () => void) => {
    if (!user) {
      setAuthAction(action)
      setShowAuthDialog(true)
    } else {
      callback()
    }
  }

  const handlePriceClick = () => {
    if (!user) {
      setAuthAction('zobrazit přesnou cenu')
      setShowAuthDialog(true)
    }
  }

  const handleProductUrlClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault()
      setAuthAction('zobrazit odkaz na produkt')
      setShowAuthDialog(true)
    }
  }

  // Maskování ceny pro neregistrované uživatele
  const displayPrice = () => {
    if (!gift.price) return null
    if (!user) {
      return (
        <button
          onClick={handlePriceClick}
          className="text-lg font-bold text-primary-600 hover:text-primary-700 transition-colors relative group"
        >
          <span className="filter blur-sm">
            {formatPrice(gift.price, gift.currency)}
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="h-4 w-4 text-primary-600" />
          </div>
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Klikněte pro zobrazení ceny
          </div>
        </button>
      )
    }
    return (
      <span className="text-lg font-bold text-primary-600">
        {formatPrice(gift.price, gift.currency)}
      </span>
    )
  }

  return (
    <div className={`card hover:shadow-md transition-all duration-200 ${
      gift.is_reserved ? 'opacity-75 bg-gray-50' : ''
    }`}>
      {gift.image_url && !imageError && (
        <div className="relative">
          <img
            src={gift.image_url}
            alt={gift.title}
            className="w-full h-48 object-cover rounded-t-lg"
            onError={handleImageError}
          />
          {gift.is_reserved && (
            <div className="absolute inset-0 bg-black bg-opacity-30 rounded-t-lg flex items-center justify-center">
              <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                Rezervováno
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className="card-header">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {gift.title}
            </h3>
            
            {gift.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {gift.description}
              </p>
            )}
            
            <div className="flex items-center space-x-2 mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(gift.priority)}`}>
                {getPriorityLabel(gift.priority)}
              </span>
              
              {gift.is_group_gift && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Users className="h-3 w-3 mr-1" />
                  Skupinový
                </span>
              )}
              
              {displayPrice()}
            </div>
            
            {gift.product_url && (
              <a
                href={gift.product_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleProductUrlClick}
                className={`inline-flex items-center text-sm transition-colors relative group ${
                  user 
                    ? 'text-primary-600 hover:text-primary-700' 
                    : 'text-gray-400 cursor-pointer hover:text-primary-600'
                }`}
              >
                {user ? (
                  <ExternalLink className="h-4 w-4 mr-1" />
                ) : (
                  <Lock className="h-4 w-4 mr-1" />
                )}
                {user ? 'Zobrazit produkt' : 'Odkaz na produkt'}
                {!user && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Přihlaste se pro odkaz
                  </div>
                )}
              </a>
            )}
          </div>

          {(isOwner || canReserve || canUnreserve) && (
            <Menu as="div" className="relative">
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
                    {canReserve && onReserve && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleAuthAction('rezervovat dárek', () => onReserve(gift))}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex items-center w-full px-4 py-2 text-sm text-green-600`}
                          >
                            <ShoppingCart className="h-4 w-4 mr-3" />
                            Rezervovat
                          </button>
                        )}
                      </Menu.Item>
                    )}
                    
                    {canUnreserve && onUnreserve && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => onUnreserve(gift)}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex items-center w-full px-4 py-2 text-sm text-orange-600`}
                          >
                            <ShoppingCart className="h-4 w-4 mr-3" />
                            Zrušit rezervaci
                          </button>
                        )}
                      </Menu.Item>
                    )}
                    
                    {isOwner && onEdit && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => onEdit(gift)}
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
                    
                    {isOwner && onDelete && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => onDelete(gift)}
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
          )}
        </div>
      </div>
      
      {gift.is_reserved && (
        <div className="card-footer">
          <div className="text-xs text-gray-500">
            Rezervováno {gift.reserved_at && new Date(gift.reserved_at).toLocaleDateString('cs-CZ')}
          </div>
        </div>
      )}
      
      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        action={authAction}
      />
    </div>
  )
}