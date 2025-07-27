import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Heart, User, Clock, Share2 } from 'lucide-react'
import { OptimizedImage } from '@/components/OptimizedImage'
import { useAuth } from '@/context/AuthContext'
import { ShareService } from '@/services/shareService'

interface SharedWishlist {
  id: string
  wishlist_id: string
  shared_by: string
  shared_with: string
  viewed_at: string | null
  first_viewed_at: string | null
  created_at: string
  wishlists: {
    id: string
    title: string
    description: string | null
    image_url: string | null
    occasion: string | null
    share_id: string | null
    created_at: string
    users: {
      id: string
      email: string
      raw_user_meta_data: any
    }
  }
}

export function SharedWithMe() {
  const { user } = useAuth()
  const [sharedLists, setSharedLists] = useState<SharedWishlist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSharedLists() {
      if (!user) return

      try {
        setLoading(true)
        const data = await ShareService.getSharedWithMe(user.id)
        setSharedLists(data as SharedWishlist[])
      } catch (error) {
        console.error('Chyba při načítání sdílených seznamů:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSharedLists()
  }, [user])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'právě teď'
    if (diffInMinutes < 60) return `před ${diffInMinutes} minutami`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `před ${diffInHours} hodinami`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `před ${diffInDays} dny`
    
    return formatDate(dateString)
  }

  const getUserDisplayName = (userData: any) => {
    return userData?.raw_user_meta_data?.display_name || 
           userData?.raw_user_meta_data?.full_name || 
           userData?.email?.split('@')[0] || 
           'Neznámý uživatel'
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Share2 className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Sdíleno se mnou</h1>
          </div>
          
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (sharedLists.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Share2 className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Sdíleno se mnou</h1>
          </div>

          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Žádné sdílené seznamy
            </h3>
            <p className="text-gray-600 mb-6">
              Zatím s vámi nikdo nesdílel žádný seznam přání.
            </p>
            <Link to="/wishlists" className="btn-primary">
              Prohlédnout moje seznamy
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Share2 className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Sdíleno se mnou</h1>
          </div>
          <div className="text-sm text-gray-500">
            {sharedLists.length} {sharedLists.length === 1 ? 'seznam' : 'seznamů'}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sharedLists.map((shared) => {
            return (
              <div key={shared.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {shared.wishlists.title}
                      </h3>
                      {shared.wishlists.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {shared.wishlists.description}
                        </p>
                      )}
                    </div>
                    {shared.wishlists.image_url && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden ml-3 flex-shrink-0">
                        <OptimizedImage
                          src={shared.wishlists.image_url}
                          alt=""
                          className="w-full h-full"
                          aspectRatio={1}
                          objectFit="cover"
                        />
                      </div>
                    )}
                  </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-2" />
                    <span>Sdílel {getUserDisplayName(shared.wishlists.users)}</span>
                  </div>
                  

                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      Sdíleno {formatRelativeTime(shared.created_at)}
                    </span>
                  </div>

                  {shared.first_viewed_at && (
                    <div className="flex items-center text-sm text-green-600">
                      <Eye className="h-4 w-4 mr-2" />
                      <span>
                        Poprvé zobrazeno {formatRelativeTime(shared.first_viewed_at)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/shared/${shared.wishlists.share_id}`}
                    className="btn-primary flex-1 text-center"
                  >
                    Zobrazit seznam
                  </Link>
                </div>

                {!shared.first_viewed_at && (
                  <div className="mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full inline-flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                    Nový
                  </div>
                )}
              </div>
            </div>
            )
          })}
        </div>

        <div className="text-center text-sm text-gray-500 pt-8 border-t">
          <p>
            Seznamy sdílené přímo s vámi se zobrazují zde. 
            <Link to="/wishlists" className="text-primary-600 hover:text-primary-500 ml-1">
              Prohlédnout vlastní seznamy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}