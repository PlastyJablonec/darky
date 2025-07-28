import { useState, useEffect } from 'react'
import { Users, Shield, Calendar, Eye, Trash2, AlertTriangle } from 'lucide-react'
import { ShareService } from '@/services/shareService'

interface AccessControlProps {
  wishlistId: string
  onClose: () => void
}

interface AccessUser {
  id: string
  userId: string
  displayName: string
  email?: string
  accessType: 'shared' | 'public'
  sharedAt?: string
  lastViewedAt?: string
  firstViewedAt?: string
  canRemove: boolean
}

export function AccessControl({ wishlistId, onClose }: AccessControlProps) {
  const [accessList, setAccessList] = useState<AccessUser[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    loadAccessList()
  }, [wishlistId])

  const loadAccessList = async () => {
    try {
      setLoading(true)
      const data = await ShareService.getAccessList(wishlistId)
      setAccessList(data)
    } catch (error) {
      console.error('Error loading access list:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeAccess = async (userId: string, displayName: string) => {
    if (!confirm(`Opravdu chcete odebrat přístup uživateli "${displayName}"?`)) {
      return
    }

    try {
      setRemoving(userId)
      await ShareService.revokeAccess(wishlistId, userId)
      await loadAccessList() // Reload the list
    } catch (error) {
      console.error('Error revoking access:', error)
      alert('Chyba při odebírání přístupu: ' + (error instanceof Error ? error.message : 'Neznámá chyba'))
    } finally {
      setRemoving(null)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nikdy'
    return new Date(dateString).toLocaleString('cs-CZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAccessTypeLabel = (type: 'shared' | 'public') => {
    return type === 'shared' ? 'Přímé sdílení' : 'Veřejný odkaz'
  }

  const getAccessTypeColor = (type: 'shared' | 'public') => {
    return type === 'shared' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Správa přístupů
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <span className="sr-only">Zavřít</span>
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Spravujte, kdo má přístup k vašemu seznamu přání
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : accessList.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Žádní uživatelé s přístupem
              </h3>
              <p className="text-gray-600">
                Váš seznam zatím nikdo nenavštívil nebo s nikým nebyl sdílen.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {accessList.map((user) => (
                <div
                  key={user.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {user.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {user.displayName}
                          </h4>
                          {user.email && (
                            <p className="text-sm text-gray-600">{user.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccessTypeColor(user.accessType)}`}>
                          {getAccessTypeLabel(user.accessType)}
                        </span>
                        
                        {user.sharedAt && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Sdíleno: {formatDate(user.sharedAt)}</span>
                          </div>
                        )}
                        
                        {user.lastViewedAt && (
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>Poslední návštěva: {formatDate(user.lastViewedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {user.canRemove && (
                      <button
                        onClick={() => handleRevokeAccess(user.userId, user.displayName)}
                        disabled={removing === user.userId}
                        className="btn-outline text-red-600 hover:bg-red-50 px-3 py-1 text-sm flex items-center space-x-1"
                        title="Odebrat přístup"
                      >
                        {removing === user.userId ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            <span>Odebrat</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-start space-x-2 text-sm text-gray-600">
            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Upozornění:</p>
              <p>
                Odebrání přístupu zabrání uživateli v dalším prohlížení seznamu, 
                ale neovlivní již vytvořené příspěvky na skupinové dárky.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}