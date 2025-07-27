import { useState, useEffect } from 'react'

interface BuildInfo {
  version: string
  gitHash: string
  buildDate: string
  lastCommitDate: string
}

export function useBuildInfo() {
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBuildInfo() {
      try {
        const response = await fetch('/build-info.json')
        if (response.ok) {
          const info = await response.json()
          setBuildInfo(info)
        }
      } catch (error) {
        console.warn('Could not load build info:', error)
        // Fallback
        setBuildInfo({
          version: '1.0.0',
          gitHash: 'unknown',
          buildDate: new Date().toISOString(),
          lastCommitDate: new Date().toISOString()
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBuildInfo()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return {
    buildInfo,
    loading,
    formatDate
  }
}