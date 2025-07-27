import { useState, useEffect } from 'react'
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface ImageModalProps {
  src: string
  alt: string
  isOpen: boolean
  onClose: () => void
}

export function ImageModal({ src, alt, isOpen, onClose }: ImageModalProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)

  // Reset na původní stav při otevření
  useEffect(() => {
    if (isOpen) {
      setScale(1)
      setRotation(0)
    }
  }, [isOpen])

  // Zavření na Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
      onClick={onClose}
    >
      {/* Ovládací panel */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center space-x-1 sm:space-x-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setScale(s => Math.max(0.5, s - 0.25))
          }}
          className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors touch-manipulation"
          title="Zmenšit"
        >
          <ZoomOut className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            setScale(s => Math.min(3, s + 0.25))
          }}
          className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors touch-manipulation"
          title="Zvětšit"
        >
          <ZoomIn className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            setRotation(r => r + 90)
          }}
          className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors touch-manipulation"
          title="Otočit"
        >
          <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors touch-manipulation"
          title="Zavřít"
        >
          <X className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
      </div>

      {/* Informace o ovládání */}
      <div 
        className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white/80 text-xs sm:text-sm text-center px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="hidden sm:block">Klikněte mimo obrázek nebo stiskněte Escape pro zavření</p>
        <p className="sm:hidden">Klepněte mimo obrázek pro zavření</p>
      </div>

      {/* Obrázek */}
      <div 
        className="relative max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center'
          }}
        />
      </div>
    </div>
  )
}