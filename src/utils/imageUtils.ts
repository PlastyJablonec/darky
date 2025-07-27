// Utility funkce pro práci s obrázky

export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const resizeImage = (file: File, maxWidth = 800, maxHeight = 600, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Vypočítej nové rozměry s poměrem stran
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height

      // Vykresli zmenšený obrázek
      ctx?.drawImage(img, 0, 0, width, height)

      // Převeď na base64
      const resizedBase64 = canvas.toDataURL('image/jpeg', quality)
      resolve(resizedBase64)
    }

    img.src = URL.createObjectURL(file)
  })
}

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Kontrola typu souboru
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Soubor musí být obrázek' }
  }

  // Kontrola velikosti (5MB limit)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Obrázek je příliš velký (max 5MB)' }
  }

  return { valid: true }
}

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.src = URL.createObjectURL(file)
  })
}