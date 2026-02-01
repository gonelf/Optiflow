const VERCEL_API_URL = 'https://api.vercel.com'

interface VercelDomainVerification {
  type: string
  domain: string
  value: string
}

export interface VercelDomainResponse {
  id: string
  name: string
  verified: boolean
  verification?: VercelDomainVerification[]
}

export class VercelDomainsService {
  private static getHeaders(): Record<string, string> {
    const token = process.env.VERCEL_API_TOKEN
    if (!token) {
      throw new Error('VERCEL_API_TOKEN is not configured. Add it to your .env file.')
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }

  private static getProjectId(): string {
    const projectId = process.env.VERCEL_PROJECT_ID
    if (!projectId) {
      throw new Error('VERCEL_PROJECT_ID is not configured. Add it to your .env file.')
    }
    return projectId
  }

  static async addDomain(domain: string): Promise<VercelDomainResponse> {
    const projectId = this.getProjectId()
    const response = await fetch(
      `${VERCEL_API_URL}/v9/projects/${projectId}/domains`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ name: domain }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to add domain to Vercel')
    }

    return data as VercelDomainResponse
  }

  static async getDomain(domain: string): Promise<VercelDomainResponse> {
    const projectId = this.getProjectId()
    const response = await fetch(
      `${VERCEL_API_URL}/v9/projects/${projectId}/domains/${domain}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch domain from Vercel')
    }

    return data as VercelDomainResponse
  }

  static async removeDomain(domain: string): Promise<void> {
    const projectId = this.getProjectId()
    const response = await fetch(
      `${VERCEL_API_URL}/v9/projects/${projectId}/domains/${domain}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
    )

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error?.message || 'Failed to remove domain from Vercel')
    }
  }
}
