const isHostedEnvironment = () =>
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'

export const debugLog = (message: string, data?: unknown) => {
  if (import.meta.env.DEV || isHostedEnvironment()) {
    console.log(`DEBUG: ${message}`, data)
  }
}

export const debugError = (message: string, error?: unknown) => {
  console.error(`ERROR: ${message}`, error)

  if (isHostedEnvironment()) {
    console.error('PRODUCTION ERROR:', {
      message,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    })
  }
}

export const debugSupabase = () => {
  debugLog('Supabase Config:', {
    url: import.meta.env.VITE_SUPABASE_URL,
    hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    keyPreview: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
  })
}

export const runProductionDiagnostics = () => {
  console.group('PRODUCTION DIAGNOSTICS')

  console.log('Environment Info:', {
    hostname: window.location.hostname,
    href: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  })

  console.log('Supabase Config:', {
    url: import.meta.env.VITE_SUPABASE_URL || 'MISSING',
    hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    keyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0,
    isDev: import.meta.env.DEV,
  })

  fetch('https://httpbin.org/status/200')
    .then(() => console.log('Network: OK'))
    .catch(err => console.error('Network: ERROR', err))

  if (import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('mock')) {
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
      },
    })
      .then(response => {
        console.log('Supabase API Response:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
        })
      })
      .catch(err => console.error('Supabase API: ERROR', err))
  }

  console.groupEnd()
}
