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

// Komplexní diagnostika produkčního prostředí
export const runProductionDiagnostics = () => {
  console.group('🔍 PRODUKČNÍ DIAGNOSTIKA')
  
  // Základní info o prostředí
  console.log('📊 Environment Info:', {
    hostname: window.location.hostname,
    href: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  })

  // Supabase konfigurace
  console.log('🗄️ Supabase Config:', {
    url: import.meta.env.VITE_SUPABASE_URL || 'CHYBÍ!',
    hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    keyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0,
    isDev: import.meta.env.DEV
  })

  // Network connectivity test
  fetch('https://httpbin.org/status/200')
    .then(() => console.log('🌐 Network: OK'))
    .catch(err => console.error('🌐 Network: ERROR', err))

  // Supabase connectivity test
  if (import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('mock')) {
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`
      }
    })
    .then(response => {
      console.log('🗄️ Supabase API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })
    })
    .catch(err => console.error('🗄️ Supabase API: ERROR', err))
  }

  console.groupEnd()
}