'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useWorkspace } from '@/hooks/use-workspace'
import { useToast } from '@/hooks/use-toast'
import { Trash2, Plus, CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import { StartingPageSelector } from '@/components/workspace/starting-page-selector'

interface DnsRecord {
  type: string
  domain: string
  value: string
}

interface CustomDomain {
  id: string
  domain: string
  status: 'PENDING' | 'ACTIVE' | 'FAILED'
  dnsRecords: DnsRecord[] | null
  createdAt: string
}

export default function WorkspaceSettings() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const workspaceSlug = params.workspaceSlug as string
  const { currentWorkspace, workspace, updateWorkspace, deleteWorkspace, role } = useWorkspace(workspaceSlug)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: currentWorkspace?.name || '',
    slug: currentWorkspace?.slug || '',
  })

  // Custom domain state
  const [domains, setDomains] = useState<CustomDomain[]>([])
  const [newDomain, setNewDomain] = useState('')
  const [isDomainLoading, setIsDomainLoading] = useState(false)

  // Update form data when workspace loads
  useEffect(() => {
    if (currentWorkspace) {
      setFormData({
        name: currentWorkspace.name || '',
        slug: currentWorkspace.slug || '',
      })
      fetchDomains()
    }
  }, [currentWorkspace])

  const fetchDomains = async () => {
    if (!currentWorkspace) return
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/domains`)
      if (res.ok) {
        const data = await res.json()
        setDomains(data.domains)
      }
    } catch (err) {
      console.error('Failed to fetch domains:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentWorkspace) return

    setIsLoading(true)
    try {
      await updateWorkspace(currentWorkspace.id, formData)
      toast({
        title: 'Success',
        description: 'Workspace settings updated',
      })
      // Redirect if slug changed
      if (formData.slug !== workspaceSlug) {
        router.push(`/${formData.slug}/settings`)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update workspace',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddDomain = async () => {
    if (!currentWorkspace || !newDomain.trim()) return
    setIsDomainLoading(true)
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain.trim().toLowerCase() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message)
      }
      toast({ title: 'Success', description: 'Domain added. Configure the DNS record below to activate it.' })
      setNewDomain('')
      await fetchDomains()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to add domain', variant: 'destructive' })
    } finally {
      setIsDomainLoading(false)
    }
  }

  const handleRemoveDomain = async (domain: string) => {
    if (!currentWorkspace) return
    if (!confirm(`Remove ${domain}? This will also remove it from your Vercel project.`)) return
    setIsDomainLoading(true)
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/domains/${domain}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message)
      }
      toast({ title: 'Success', description: `${domain} has been removed` })
      await fetchDomains()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to remove domain', variant: 'destructive' })
    } finally {
      setIsDomainLoading(false)
    }
  }

  const handleRefreshStatus = async (domain: string) => {
    if (!currentWorkspace) return
    setIsDomainLoading(true)
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/domains/${domain}`)
      if (res.ok) {
        await fetchDomains()
        toast({ title: 'Refreshed', description: 'Domain status updated' })
      }
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to refresh status', variant: 'destructive' })
    } finally {
      setIsDomainLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!currentWorkspace) return

    const confirmed = confirm(
      'Are you sure you want to delete this workspace? This action cannot be undone.'
    )
    if (!confirmed) return

    setIsLoading(true)
    try {
      await deleteWorkspace(currentWorkspace.id)
      toast({
        title: 'Success',
        description: 'Workspace deleted',
      })
      router.push('/')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete workspace',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  const handleStartingPageUpdate = async (startingPageId: string | null) => {
    if (!currentWorkspace) return
    await updateWorkspace(currentWorkspace.id, { startingPageId })
  }

  const isAdmin = role === 'ADMIN' || role === 'OWNER'
  const isOwner = role === 'OWNER'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workspace Settings</h1>
        <p className="text-muted-foreground">Manage your workspace configuration</p>
      </div>

      {/* General Settings */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Update your workspace name and slug</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workspace Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isAdmin || isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Workspace Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                disabled={!isAdmin || isLoading}
                pattern="[a-z0-9\-]+"
                required
              />
              <p className="text-xs text-muted-foreground">
                This will be used in your workspace URL
              </p>
            </div>
            {isAdmin && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </CardContent>
        </Card>
      </form>

      {/* Custom Domains */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Domains</CardTitle>
          <CardDescription>
            Connect your own domain to serve your public pages instead of the default subdomain.
            Vercel handles SSL automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add domain form */}
          {isAdmin && (
            <div className="flex gap-2">
              <Input
                placeholder="example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                disabled={isDomainLoading}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDomain())}
              />
              <Button
                type="button"
                onClick={handleAddDomain}
                disabled={isDomainLoading || !newDomain.trim()}
              >
                <Plus className="mr-2 h-4 w-4" />
                {isDomainLoading ? 'Adding...' : 'Add'}
              </Button>
            </div>
          )}

          {/* Domain list */}
          {domains.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No custom domains configured yet.
            </p>
          ) : (
            <div className="space-y-4">
              {domains.map((d) => (
                <div key={d.id} className="border rounded-lg p-4 space-y-3">
                  {/* Domain header row */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      {d.status === 'ACTIVE' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {d.status === 'PENDING' && <Clock className="h-4 w-4 text-amber-500" />}
                      {d.status === 'FAILED' && <AlertCircle className="h-4 w-4 text-red-500" />}
                      <span className="font-medium text-sm">{d.domain}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          d.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : d.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {d.status === 'ACTIVE' ? 'Active' : d.status === 'PENDING' ? 'Pending' : 'Failed'}
                      </span>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1">
                        {d.status !== 'ACTIVE' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRefreshStatus(d.domain)}
                            disabled={isDomainLoading}
                            title="Refresh verification status"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDomain(d.domain)}
                          disabled={isDomainLoading}
                          className="text-destructive hover:text-destructive"
                          title="Remove domain"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* DNS instructions for pending domains */}
                  {d.status !== 'ACTIVE' && d.dnsRecords && d.dnsRecords.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Add the following DNS record at your domain registrar to verify ownership:
                      </p>
                      <div className="bg-muted rounded p-3 overflow-x-auto">
                        <table className="w-full text-xs font-mono">
                          <thead>
                            <tr className="text-muted-foreground">
                              <th className="text-left pb-1 pr-4">Type</th>
                              <th className="text-left pb-1 pr-4">Name</th>
                              <th className="text-left pb-1">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {d.dnsRecords.map((rec, i) => (
                              <tr key={i}>
                                <td className="pr-4">{rec.type}</td>
                                <td className="pr-4">{rec.domain}</td>
                                <td className="break-all">{rec.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* General DNS reference */}
          <div className="border-t pt-4 mt-2">
            <p className="text-xs text-muted-foreground">
              <strong>How it works:</strong> For subdomains (e.g.{' '}
              <code className="bg-muted px-1 rounded">www.example.com</code>), add a{' '}
              <strong>CNAME</strong> record pointing to{' '}
              <code className="bg-muted px-1 rounded">cname.vercel.app</code>. For apex/root
              domains (e.g. <code className="bg-muted px-1 rounded">example.com</code>), add an{' '}
              <strong>A</strong> record pointing to{' '}
              <code className="bg-muted px-1 rounded">76.76.21.21</code>. DNS changes can take
              up to 24 hours to propagate.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Starting Page */}
      {currentWorkspace && (
        <StartingPageSelector
          workspaceId={currentWorkspace.id}
          currentStartingPage={workspace?.startingPage}
          onUpdate={handleStartingPageUpdate}
          isAdmin={isAdmin}
          isLoading={isLoading}
        />
      )}

      {/* Danger Zone */}
      {isOwner && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for this workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Workspace
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
