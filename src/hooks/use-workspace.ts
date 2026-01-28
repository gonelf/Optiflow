import { useEffect, useState } from 'react'
import useSWR from 'swr'

interface Workspace {
  id: string
  name: string
  slug: string
  plan: string
  role: string
  domain?: string | null
  _count?: {
    members: number
    pages: number
  }
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    // Attach extra info to the error object.
    const info = await res.json()
    // @ts-ignore
    error.status = res.status
    // @ts-ignore
    error.info = info
    throw error
  }
  return res.json()
}

export function useWorkspace(workspaceSlug?: string) {
  // Fetch all workspaces
  const {
    data: workspacesData,
    error,
    mutate,
    isLoading: isAllWorkspacesLoading,
  } = useSWR<{ workspaces: Workspace[] }>('/api/workspaces', fetcher)

  // Derive current workspace from list
  const currentWorkspace = workspacesData?.workspaces
    ? workspaceSlug
      ? workspacesData.workspaces.find((w) => w.slug === workspaceSlug) || null
      : workspacesData.workspaces[0] || null
    : null

  // Fetch specific workspace details
  const {
    data: workspaceData,
    error: workspaceError,
    mutate: mutateWorkspace,
    isLoading: isWorkspaceDetailsLoading,
  } = useSWR(
    currentWorkspace?.id ? `/api/workspaces/${currentWorkspace.id}` : null,
    fetcher
  )

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
    isLoading: isAllWorkspacesLoading || (!!currentWorkspace && isWorkspaceDetailsLoading),
    isError: !!error || !!workspaceError,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    mutate,
  }
}
