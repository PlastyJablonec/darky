import { useState, useRef, useEffect } from 'react'
import { ImageModal } from './ImageModal'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  aspectRatio?: number // Šířka/výška (např. 2 pro 2:1)
  fallback?: string
  lazy?: boolean
  sizes?: string
  onLoad?: () => void
  onError?: () => void
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  clickable?: boolean
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  aspectRatio = 2,
  fallback,
  lazy = true,
  sizes = '(max-width: 640px) 400px, (max-width: 1024px) 600px, 800px',
  onLoad,
  onError,
  objectFit = 'cover',
  clickable = false
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(!lazy)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Intersection Observer pro lazy loading
  useEffect(() => {
    if (!lazy || isInView) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observerRef.current?.disconnect()
          }
        })
      },
      {
        rootMargin: '50px'
      }
    )

    if (containerRef.current) {
      observerRef.current.observe(containerRef.current)
    }

    return () => {
      observerRef.current?.disconnect()
    }
  }, [lazy, isInView])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  // Placeholder dimensions
  const placeholderHeight = aspectRatio ? `${100 / aspectRatio}%` : 'auto'

  if (!src && !fallback) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ paddingBottom: placeholderHeight }}
      >
        <span className="text-gray-400 text-sm">Žádný obrázek</span>
      </div>
    )
  }

  const imageUrl = hasError && fallback ? fallback : src

  return (
    <>
      <div 
        ref={containerRef} 
        className={`relative overflow-hidden ${className} ${clickable && isLoaded ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
        onClick={clickable && isLoaded ? (e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsModalOpen(true)
        } : undefined}
      >
        {/* Placeholder pro aspect ratio */}
        <div 
          className="w-full"
          style={{ paddingBottom: placeholderHeight }}
        />
        
        {/* Loading placeholder */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Actual image */}
        {isInView && (
          <img
            src={imageUrl}
            sizes={sizes}
            alt={alt}
            className={`absolute inset-0 w-full h-full object-${objectFit} transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleLoad}
            onError={handleError}
            loading={lazy ? 'lazy' : 'eager'}
          />
        )}
        

        {/* Error state */}
        {hasError && !fallback && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-2xl mb-2">📷</div>
              <div className="text-sm">Obrázek se nepodařilo načíst</div>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {clickable && (
        <ImageModal
          src={imageUrl}
          alt={alt}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}