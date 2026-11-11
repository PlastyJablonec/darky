import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { About } from '@/pages/About'
import { AuthCallback } from '@/pages/AuthCallback'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/Login'
import { QuickAddGift } from '@/pages/QuickAddGift'
import { Register } from '@/pages/Register'
import { Settings } from '@/pages/Settings'
import { SharedWithMe } from '@/pages/SharedWithMe'
import { SharedWishlist } from '@/pages/SharedWishlist'
import { WishlistDetail } from '@/pages/WishlistDetail'
import { Wishlists } from '@/pages/Wishlists'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/wishlists"
        element={(
          <ProtectedRoute>
            <Wishlists />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/wishlists/:id"
        element={(
          <ProtectedRoute>
            <WishlistDetail />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/quick-add"
        element={(
          <ProtectedRoute>
            <QuickAddGift />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/shared-with-me"
        element={(
          <ProtectedRoute>
            <SharedWithMe />
          </ProtectedRoute>
        )}
      />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/shared/:shareId" element={<SharedWishlist />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
