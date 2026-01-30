'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useWorkspace } from '@/hooks/use-workspace'
import { CreateWorkspaceModal } from './create-workspace-modal'
import { cn } from '@/lib/utils'

interface WorkspaceSwitcherProps {
  workspaceSlug?: string
  isCollapsed?: boolean
}

export function WorkspaceSwitcher({ workspaceSlug, isCollapsed }: WorkspaceSwitcherProps) {
  const router = useRouter()
  const { workspaces, currentWorkspace } = useWorkspace(workspaceSlug)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleWorkspaceChange = (slug: string) => {
    router.push(`/${slug}`)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'flex w-full items-center gap-2',
              isCollapsed ? 'justify-center px-2' : 'justify-between'
            )}
          >
            {isCollapsed ? (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold shrink-0">
                {currentWorkspace?.name?.charAt(0).toUpperCase() || 'W'}
              </div>
            ) : (
              <>
                <span className="truncate">{currentWorkspace?.name || 'Select workspace'}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => handleWorkspaceChange(workspace.slug)}
              className="cursor-pointer"
            >
              <Check
                className={cn(
                  'mr-2 h-4 w-4',
                  currentWorkspace?.id === workspace.id ? 'opacity-100' : 'opacity-0'
                )}
              />
              <div className="flex flex-col">
                <span>{workspace.name}</span>
                <span className="text-xs text-muted-foreground">{workspace.plan}</span>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowCreateModal(true)} className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Create workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateWorkspaceModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </>
  )
}
