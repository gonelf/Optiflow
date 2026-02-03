'use client'

import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { WorkspaceSwitcher } from '@/components/workspace/workspace-switcher'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { Home, FileText, TestTube, BarChart, Settings, LogOut, PanelLeft, Shield, ExternalLink } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const params = useParams()
  const pathname = usePathname()
  const workspaceSlug = params.workspaceSlug as string
  const { data: session } = useSession()

  // Auto-collapse on editor pages (e.g. /workspace/pages/pageId)
  // We check if we are deep enough in the 'pages' route.
  // /workspace/pages/pageId -> split length 4 (['', 'workspace', 'pages', 'pageId']) if no extra slashes.
  // But safest is to check if we have a pageId parameter.
  // Wait, params are available!
  const pageId = params.pageId
  const isEditorPage = !!pageId && pathname?.includes('/pages/')

  useEffect(() => {
    if (isEditorPage) {
      setIsCollapsed(true)
    }
  }, [isEditorPage])

  // Construct public URL
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
  const protocol = rootDomain.includes('localhost') ? 'http' : 'https'
  const publicUrl = `${protocol}://${workspaceSlug}.${rootDomain}`

  const navigation = [
    { name: 'Dashboard', href: `/${workspaceSlug}`, icon: Home },
    { name: 'Pages', href: `/${workspaceSlug}/pages`, icon: FileText },
    { name: 'A/B Tests', href: `/${workspaceSlug}/ab-tests`, icon: TestTube },
    { name: 'Analytics', href: `/${workspaceSlug}/analytics`, icon: BarChart },
    { name: 'Settings', href: `/${workspaceSlug}/settings`, icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'relative border-r bg-card transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-[70px]' : 'w-64'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo & Toggle */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            {!isCollapsed ? (
              <div className="flex items-center space-x-2">
                <Image src="/logo.svg" alt="Reoptimize" width={24} height={24} className="h-6 w-6" />
                <h1 className="text-xl font-bold">Reoptimize</h1>
              </div>
            ) : (
              <Image src="/logo.svg" alt="Reoptimize" width={24} height={24} className="h-6 w-6 mx-auto" />
            )}
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', isCollapsed && 'mx-auto')}
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Workspace Switcher */}
          <div className="p-4">
            <WorkspaceSwitcher workspaceSlug={workspaceSlug} isCollapsed={isCollapsed} />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full',
                    isCollapsed ? 'justify-center px-2' : 'justify-start'
                  )}
                >
                  <item.icon className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
                  {!isCollapsed && item.name}
                </Button>
              </Link>
            ))}

            {/* Admin Link */}
            {session?.user?.systemRole === 'ADMIN' && (
              <Link href="/admin/dashboard">
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full text-red-500 hover:text-red-600 hover:bg-red-50',
                    isCollapsed ? 'justify-center px-2' : 'justify-start'
                  )}
                >
                  <Shield className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
                  {!isCollapsed && 'Admin Dashboard'}
                </Button>
              </Link>
            )}

            {/* Public Site Link */}
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                className={cn(
                  'w-full text-muted-foreground hover:text-foreground',
                  isCollapsed ? 'justify-center px-2' : 'justify-start'
                )}
              >
                <ExternalLink className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
                {!isCollapsed && 'View Site'}
              </Button>
            </a>
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className={cn(
                'w-full',
                isCollapsed ? 'justify-center px-2' : 'justify-start'
              )}
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
              {!isCollapsed && 'Sign out'}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn("flex-1 overflow-y-auto", isEditorPage && "flex flex-col h-screen overflow-hidden")}>
        <div className={cn(
          !isEditorPage && "container py-8 px-8",
          isEditorPage && "flex-1 h-full"
        )}>
          {children}
        </div>
      </main>
    </div>
  )
}
