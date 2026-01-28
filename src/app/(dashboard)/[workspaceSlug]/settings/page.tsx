'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useWorkspace } from '@/hooks/use-workspace'
import { useToast } from '@/hooks/use-toast'
import { Trash2 } from 'lucide-react'

export default function WorkspaceSettings() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const workspaceSlug = params.workspaceSlug as string
  const { currentWorkspace, updateWorkspace, deleteWorkspace, role } = useWorkspace(workspaceSlug)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: currentWorkspace?.name || '',
    slug: currentWorkspace?.slug || '',
    domain: currentWorkspace?.domain || '',
  })

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

  const isAdmin = role === 'ADMIN' || role === 'OWNER'
  const isOwner = role === 'OWNER'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workspace Settings</h1>
        <p className="text-muted-foreground">Manage your workspace configuration</p>
      </div>

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
            <div className="space-y-2">
              <Label htmlFor="domain">Custom Domain</Label>
              <Input
                id="domain"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                disabled={!isAdmin || isLoading}
                placeholder="example.com"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Connect your custom domain
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
