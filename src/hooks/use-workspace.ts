import { useEffect, useState } from 'react'
import useSWR from 'swr'

interface Workspace {
  id: string
  name: string
  slug: string
  plan: string
  role: string
  _count?: {
    members: number
    pages: number
  }
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useWorkspace(workspaceSlug?: string) {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)

  // Fetch all workspaces
  const {
    data: workspacesData,
    error,
    mutate,
  } = useSWR<{ workspaces: Workspace[] }>('/api/workspaces', fetcher)

  // Fetch specific workspace
  const {
    data: workspaceData,
    error: workspaceError,
    mutate: mutateWorkspace,
  } = useSWR(
    currentWorkspace?.id ? `/api/workspaces/${currentWorkspace.id}` : null,
    fetcher
  )

  useEffect(() => {
    if (workspacesData?.workspaces && workspaceSlug) {
      const workspace = workspacesData.workspaces.find((w) => w.slug === workspaceSlug)
      setCurrentWorkspace(workspace || null)
    } else if (workspacesData?.workspaces && !workspaceSlug) {
      // Default to first workspace if no slug provided
      setCurrentWorkspace(workspacesData.workspaces[0] || null)
    }
  }, [workspacesData, workspaceSlug])

  const createWorkspace = async (data: { name: string; slug: string }) => {
    const response = await fetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create workspace')
    }

    const result = await response.json()
    mutate() // Refresh workspaces list
    return result.workspace
  }

  const updateWorkspace = async (workspaceId: string, data: Partial<Workspace>) => {
    const response = await fetch(`/api/workspaces/${workspaceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update workspace')
    }

    const result = await response.json()
    mutate() // Refresh workspaces list
    mutateWorkspace() // Refresh current workspace
    return result.workspace
  }

  const deleteWorkspace = async (workspaceId: string) => {
    const response = await fetch(`/api/workspaces/${workspaceId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete workspace')
    }

    mutate() // Refresh workspaces list
  }

  return {
    workspaces: workspacesData?.workspaces || [],
    currentWorkspace,
    workspace: workspaceData?.workspace,
    role: workspaceData?.role,
    isLoading: !error && !workspacesData,
    isError: error || workspaceError,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    mutate,
  }
}
