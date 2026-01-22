'use client'

import { useParams } from 'next/navigation'
import { WorkspaceSwitcher } from '@/components/workspace/workspace-switcher'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Home, FileText, TestTube, BarChart, Settings, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const workspaceSlug = params.workspaceSlug as string

  const navigation = [
    { name: 'Dashboard', href: `/${workspaceSlug}`, icon: Home },
    { name: 'Pages', href: `/${workspaceSlug}/pages`, icon: FileText },
    { name: 'A/B Tests', href: `/${workspaceSlug}/ab-tests`, icon: TestTube },
    { name: 'Analytics', href: `/${workspaceSlug}/analytics`, icon: BarChart },
    { name: 'Settings', href: `/${workspaceSlug}/settings`, icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <h1 className="text-xl font-bold">OptiFlow</h1>
          </div>

          {/* Workspace Switcher */}
          <div className="p-4">
            <WorkspaceSwitcher workspaceSlug={workspaceSlug} />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button variant="ghost" className="w-full justify-start">
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container py-8">{children}</div>
      </main>
    </div>
  )
}
