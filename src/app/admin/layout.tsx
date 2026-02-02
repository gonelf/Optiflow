'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Home, Users, Ticket, UserPlus, PanelLeft, LogOut, Shield } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Invite Codes', href: '/admin/invite-codes', icon: Ticket },
    { name: 'Waitlist', href: '/admin/waitlist', icon: UserPlus },
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
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                <h1 className="text-xl font-bold">Admin</h1>
              </div>
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

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 pt-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full',
                      isCollapsed ? 'justify-center px-2' : 'justify-start'
                    )}
                  >
                    <item.icon className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
                    {!isCollapsed && item.name}
                  </Button>
                </Link>
              )
            })}
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
      <main className="flex-1 overflow-y-auto">
        <div className="container py-8 px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
