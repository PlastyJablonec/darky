import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Wishlists } from '@/pages/Wishlists'
import { WishlistDetail } from '@/pages/WishlistDetail'
import { SharedWishlist } from '@/pages/SharedWishlist'
import { SharedWithMe } from '@/pages/SharedWithMe'
import { AuthCallback } from '@/pages/AuthCallback'

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
        element={
          <ProtectedRoute>
            <Wishlists />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/wishlists/:id"
        element={
          <ProtectedRoute>
            <WishlistDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/shared-with-me"
        element={
          <ProtectedRoute>
            <SharedWithMe />
          </ProtectedRoute>
        }
      />
      
      <Route path="/shared/:shareId" element={<SharedWishlist />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App