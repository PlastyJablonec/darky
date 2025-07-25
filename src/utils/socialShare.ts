// Utility pro sociální sdílení

export interface ShareData {
  title: string
  text: string
  url: string
}

export const socialShareUrls = {
  whatsapp: (data: ShareData) => 
    `https://wa.me/?text=${encodeURIComponent(`${data.text}\n\n${data.url}`)}`,
  
  instagram: (_data: ShareData) => 
    `https://www.instagram.com/`,
  
  twitter: (data: ShareData) => 
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.text)}&url=${encodeURIComponent(data.url)}`,
  
  telegram: (data: ShareData) => 
    `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.text)}`,
  
  viber: (data: ShareData) => 
    `viber://forward?text=${encodeURIComponent(`${data.text}\n\n${data.url}`)}`,
  
  messenger: (data: ShareData) => 
    `fb-messenger://share/?link=${encodeURIComponent(data.url)}`,
  
  email: (data: ShareData) => 
    `mailto:?subject=${encodeURIComponent(data.title)}&body=${encodeURIComponent(`${data.text}\n\n${data.url}`)}`
}

export const openShareUrl = (platform: keyof typeof socialShareUrls, data: ShareData) => {
  const url = socialShareUrls[platform](data)
  
  // Pro mobilní aplikace zkusit otevřít v aplikaci, pak fallback na web
  if (['whatsapp', 'viber', 'messenger'].includes(platform)) {
    window.open(url, '_blank')
  } else {
    window.open(url, '_blank', 'width=600,height=400')
  }
}

// Native Web Share API pokud je dostupná
export const canUseNativeShare = () => {
  return 'share' in navigator && 'canShare' in navigator
}

export const nativeShare = async (data: ShareData) => {
  if (canUseNativeShare()) {
    try {
      await navigator.share(data)
      return true
    } catch (err) {
      // Uživatel zrušil sdílení nebo není podporováno
      return false
    }
  }
  return false
}

// Kopírování do schránky
export const copyToClipboard = async (text: string) => {
  try {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback pro starší prohlížeče
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      return success
    }
  } catch (err) {
    return false
  }
}

// Generování textu pro sdílení
export const generateShareText = (wishlistTitle: string, userName?: string) => {
  const baseText = `Podívej se na můj seznam přání "${wishlistTitle}"`
  return userName ? `${baseText} od ${userName}` : baseText
}