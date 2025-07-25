import { useState } from 'react'
import { Share2, MessageCircle, Send, Copy, Check, Mail, Camera } from 'lucide-react'
import { openShareUrl, canUseNativeShare, nativeShare, copyToClipboard, generateShareText, type ShareData } from '@/utils/socialShare'
import { Dialog } from './Dialog'

interface ShareButtonsProps {
  wishlistTitle: string
  shareUrl: string
  userName?: string
  onShare?: (platform: string) => void
  compact?: boolean
  showDialog?: boolean
  onCloseDialog?: () => void
}

export function ShareButtons({ wishlistTitle, shareUrl, userName, onShare, compact = false, showDialog, onCloseDialog }: ShareButtonsProps) {
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)

  const shareData: ShareData = {
    title: `Seznam přání - ${wishlistTitle}`,
    text: generateShareText(wishlistTitle, userName),
    url: shareUrl
  }

  const handleShare = async (platform: string) => {
    onShare?.(platform)
    
    if (platform === 'native') {
      const success = await nativeShare(shareData)
      if (!success) {
        // Fallback na dialog s opcemi
        setShowShareDialog(true)
        return
      }
    } else if (platform === 'copy') {
      const success = await copyToClipboard(shareUrl)
      if (success) {
        setCopiedUrl(true)
        setTimeout(() => setCopiedUrl(false), 2000)
      }
    } else {
      openShareUrl(platform as any, shareData)
    }
    
    if (onCloseDialog) {
      onCloseDialog()
    } else {
      setShowShareDialog(false)
    }
  }

  // Základní tlačítko pro otevření share dialogu
  const ShareButton = () => (
    <button
      onClick={() => setShowShareDialog(true)}
      className={compact 
        ? "p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-primary-600" 
        : "btn-outline flex items-center space-x-2"
      }
      title={compact ? "Sdílet seznam" : undefined}
    >
      <Share2 className="h-4 w-4" />
      {!compact && <span>Sdílet</span>}
    </button>
  )

  const ShareDialog = () => (
    <Dialog
      isOpen={showDialog !== undefined ? showDialog : showShareDialog}
      onClose={onCloseDialog || (() => setShowShareDialog(false))}
      title={`Sdílet "${wishlistTitle}"`}
      type="info"
    >
      <div className="space-y-4">
        {/* URL pro kopírování */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-3">
              <p className="text-sm font-medium text-gray-700 mb-1">Odkaz na seznam</p>
              <p className="text-xs text-gray-500 break-all">{shareUrl}</p>
            </div>
            <button
              onClick={() => handleShare('copy')}
              className={`btn-outline px-3 py-2 transition-colors ${
                copiedUrl ? 'text-green-600 border-green-300' : ''
              }`}
            >
              {copiedUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Sociální platformy */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Sdílet na:</p>
          <div className="grid grid-cols-2 gap-3">
            {/* WhatsApp */}
            <button
              onClick={() => handleShare('whatsapp')}
              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-colors"
            >
              <MessageCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">WhatsApp</span>
            </button>

            {/* Telegram */}
            <button
              onClick={() => handleShare('telegram')}
              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <Send className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Telegram</span>
            </button>

            {/* Instagram */}
            <button
              onClick={() => handleShare('instagram')}
              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-pink-50 hover:border-pink-300 transition-colors"
            >
              <Camera className="h-5 w-5 text-pink-600" />
              <span className="text-sm font-medium">Instagram</span>
            </button>

            {/* Email */}
            <button
              onClick={() => handleShare('email')}
              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <Mail className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium">Email</span>
            </button>
          </div>
        </div>

        {/* Kopírování odkazu */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Nebo zkopírujte odkaz:</p>
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-600"
            />
            <button
              onClick={() => handleShare('copy')}
              className="flex items-center space-x-1 px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
            >
              {copiedUrl ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Zkopírováno</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Kopírovat</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tip */}
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
          💡 <strong>Tip:</strong> Odkazy zůstávají aktivní i po smazání seznamu. 
          Sdílejte je pouze s lidmi, kterým důvěřujete!
        </div>
      </div>
    </Dialog>
  )

  // Pokud je showDialog definované, zobrazovat jen dialog
  if (showDialog !== undefined) {
    return <ShareDialog />
  }

  // Pokud je dostupné native sharing, zkusit ho nejdřív
  if (canUseNativeShare()) {
    return (
      <>
        <button
          onClick={() => handleShare('native')}
          className="btn-outline flex items-center space-x-2"
        >
          <Share2 className="h-4 w-4" />
          <span>Sdílet</span>
        </button>
        <ShareDialog />
      </>
    )
  }

  return (
    <>
      <ShareButton />
      <ShareDialog />
    </>
  )
}