'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useWorkspace } from '@/hooks/use-workspace'

export default function WorkspaceDashboard() {
  const params = useParams()
  const router = useRouter()
  const workspaceSlug = params.workspaceSlug as string
  const { currentWorkspace, isLoading, isError } = useWorkspace(workspaceSlug)

  useEffect(() => {
    if (!isLoading && !isError && !currentWorkspace) {
      router.replace('/dashboard')
    }
  }, [isLoading, isError, currentWorkspace, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!currentWorkspace) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to {currentWorkspace?.name || 'your workspace'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentWorkspace?._count?.pages || 0}</div>
            <p className="text-xs text-muted-foreground">Published and draft pages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentWorkspace?._count?.members || 0}</div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Running A/B tests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Quick actions to get your workspace up and running</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Create your first page</p>
              <p className="text-sm text-muted-foreground">
                Build a landing page with our drag-and-drop editor
              </p>
            </div>
            <a href={`/${workspaceSlug}/pages`} className="text-primary hover:underline">
              Get Started
            </a>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Invite team members</p>
              <p className="text-sm text-muted-foreground">
                Collaborate with your team on pages and tests
              </p>
            </div>
            <a
              href={`/${workspaceSlug}/settings`}
              className="text-primary hover:underline"
            >
              Invite
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
