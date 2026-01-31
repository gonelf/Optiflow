'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Home, AlertTriangle, FileText } from 'lucide-react'

interface Page {
  id: string
  title: string
  slug: string
  status: string
}

interface StartingPage {
  id: string
  title: string
  slug: string
  status?: string
}

interface StartingPageSelectorProps {
  workspaceId: string
  currentStartingPage?: StartingPage | null
  onUpdate: (startingPageId: string | null) => Promise<void>
  isAdmin: boolean
  isLoading: boolean
}

export function StartingPageSelector({
  workspaceId,
  currentStartingPage,
  onUpdate,
  isAdmin,
  isLoading,
}: StartingPageSelectorProps) {
  const { toast } = useToast()
  const [pages, setPages] = useState<Page[]>([])
  const [isLoadingPages, setIsLoadingPages] = useState(true)
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)
  const [showWarningDialog, setShowWarningDialog] = useState(false)
  const [pendingPageId, setPendingPageId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await fetch(`/api/pages?workspaceId=${workspaceId}`)
        if (response.ok) {
          const data = await response.json()
          setPages(data.pages || [])
        }
      } catch (error) {
        console.error('Failed to fetch pages:', error)
      } finally {
        setIsLoadingPages(false)
      }
    }

    fetchPages()
  }, [workspaceId])

  const handlePageSelect = (pageId: string) => {
    const newPageId = pageId === 'none' ? null : pageId

    // If there's already a starting page and we're selecting a different one, show warning
    if (currentStartingPage && newPageId && currentStartingPage.id !== newPageId) {
      setPendingPageId(newPageId)
      setShowWarningDialog(true)
    } else {
      // No conflict, just update
      handleConfirmChange(newPageId)
    }
  }

  const handleConfirmChange = async (pageId: string | null) => {
    setIsSaving(true)
    try {
      await onUpdate(pageId)
      setSelectedPageId(pageId)
      toast({
        title: 'Success',
        description: pageId ? 'Starting page updated' : 'Starting page removed',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update starting page',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
      setShowWarningDialog(false)
      setPendingPageId(null)
    }
  }

  const handleDialogConfirm = () => {
    handleConfirmChange(pendingPageId)
  }

  const handleDialogCancel = () => {
    setShowWarningDialog(false)
    setPendingPageId(null)
  }

  const pendingPage = pages.find((p) => p.id === pendingPageId)
  const currentValue = currentStartingPage?.id || 'none'

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Starting Page
          </CardTitle>
          <CardDescription>
            Set the default landing page for your workspace. This page will be shown when visitors access your workspace domain.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingPages ? (
            <div className="text-sm text-muted-foreground">Loading pages...</div>
          ) : pages.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No pages available. Create a page first to set it as the starting page.
            </div>
          ) : (
            <>
              <Select
                value={currentValue}
                onValueChange={handlePageSelect}
                disabled={!isAdmin || isLoading || isSaving}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a starting page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-muted-foreground">No starting page</span>
                  </SelectItem>
                  {pages.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{page.title}</span>
                        <span className="text-xs text-muted-foreground">/{page.slug}</span>
                        {page.status === 'DRAFT' && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                            Draft
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {currentStartingPage && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Home className="h-4 w-4 text-primary" />
                  <div>
                    <span className="text-sm font-medium">Current: </span>
                    <span className="text-sm">{currentStartingPage.title}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      /{currentStartingPage.slug}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Warning Dialog */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Change Starting Page
            </DialogTitle>
            <DialogDescription className="pt-2">
              You already have a starting page set. Only one page can be the starting page at a time.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Current starting page:</div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <FileText className="h-4 w-4" />
                <span className="font-medium">{currentStartingPage?.title}</span>
                <span className="text-xs text-muted-foreground">
                  /{currentStartingPage?.slug}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">New starting page:</div>
              <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-medium">{pendingPage?.title}</span>
                <span className="text-xs text-muted-foreground">/{pendingPage?.slug}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleDialogCancel} disabled={isSaving}>
              Keep Current
            </Button>
            <Button onClick={handleDialogConfirm} disabled={isSaving}>
              {isSaving ? 'Updating...' : 'Change to New'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
