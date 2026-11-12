import { useRef, useState } from 'react'
import ReactCrop, { type PercentCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageCropEditorProps {
  src: string
  onApply: (file: File) => void
  onCancel: () => void
}

export function ImageCropEditor({ src, onApply, onCancel }: ImageCropEditorProps) {
  const imageRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<PercentCrop>({ unit: '%', x: 0, y: 0, width: 100, height: 100 })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const applyCrop = () => {
    const image = imageRef.current
    if (!image || !image.naturalWidth || !image.naturalHeight || crop.width <= 0 || crop.height <= 0) {
      setError('Vyberte část obrázku, kterou chcete zachovat.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const canvas = document.createElement('canvas')
      const width = image.naturalWidth * crop.width / 100
      const height = image.naturalHeight * crop.height / 100
      const scale = Math.min(1, 800 / width, 600 / height)
      canvas.width = Math.max(1, Math.round(width * scale))
      canvas.height = Math.max(1, Math.round(height * scale))
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas is unavailable')
      context.drawImage(image, image.naturalWidth * crop.x / 100, image.naturalHeight * crop.y / 100,
        width, height, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        setSaving(false)
        if (!blob) {
          setError('Obrázek se nepodařilo oříznout. Zkuste to prosím znovu.')
          return
        }
        onApply(new File([blob], 'vyrez.jpg', { type: 'image/jpeg' }))
      }, 'image/jpeg', 0.9)
    } catch (err) {
      console.error('Image crop failed:', err)
      setSaving(false)
      setError('Obrázek nelze oříznout. U obrázků z jiných webů zkuste soubor nejprve stáhnout a nahrát.')
    }
  }

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p className="text-sm text-gray-700">Tažením rámečku a jeho okrajů vyberte část obrázku.</p>
      <div className="flex justify-center bg-gray-100">
        <ReactCrop className="max-h-80" crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)}>
          <img ref={imageRef} src={src} crossOrigin="anonymous" alt="Obrázek pro oříznutí"
            className="max-h-80 max-w-full" onError={() => setError('Obrázek nelze načíst pro oříznutí. Zkuste jej stáhnout a nahrát jako soubor.')} />
        </ReactCrop>
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={applyCrop} disabled={saving} className="btn-primary disabled:opacity-50">Použít výřez</button>
        <button type="button" onClick={onCancel} className="btn-secondary">Zrušit</button>
      </div>
    </div>
  )
}
