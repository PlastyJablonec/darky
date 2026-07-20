import type { LinkPreviewData } from '@/types/quickAdd'
import { normalizeHttpUrl } from '@/utils/urlUtils'

interface LinkPreviewResponse {
  data: LinkPreviewData
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = await response.json() as { error?: string }
    return payload.error || 'Nepodarilo se nacist metadata odkazu'
  } catch {
    return 'Nepodarilo se nacist metadata odkazu'
  }
}

export const linkPreviewService = {
  async fetchPreview(rawUrl: string): Promise<LinkPreviewData> {
    const normalizedUrl = normalizeHttpUrl(rawUrl)
    const encodedUrl = encodeURIComponent(normalizedUrl)

    const response = await fetch(`/api/link-preview?url=${encodedUrl}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(await readErrorMessage(response))
    }

    const payload = await response.json() as LinkPreviewResponse
    return payload.data
  },
}
