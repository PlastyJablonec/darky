// Debug utility pro diagnostiku produkčních problémů

export const debugLog = (message: string, data?: any) => {
  if (import.meta.env.DEV || window.location.hostname.includes('vercel.app')) {
    console.log(`🐛 DEBUG: ${message}`, data)
  }
}

export const debugError = (message: string, error?: any) => {
  console.error(`❌ ERROR: ${message}`, error)
  
  // V produkci pošli error do console pro debugging
  if (window.location.hostname.includes('vercel.app')) {
    console.error('PRODUCTION ERROR:', {
      message,
      error: error?.message || error,
      stack: error?.stack,
      url: window.location.href,
      timestamp: new Date().toISOString()
    })
  }
}

export const debugSupabase = () => {
  debugLog('Supabase Config:', {
    url: import.meta.env.VITE_SUPABASE_URL,
    hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    keyPreview: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
  })
}