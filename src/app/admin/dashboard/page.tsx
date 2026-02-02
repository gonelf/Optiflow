'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Ticket, UserPlus, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Stats {
    totalUsers: number
    adminUsers: number
    inviteCodes: number
    activeInviteCodes: number
    waitlistUsers: number
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        adminUsers: 0,
        inviteCodes: 0,
        activeInviteCodes: 0,
        waitlistUsers: 0,
    })
    const [isLoading, setIsLoading] = useState(true)

    const fetchStats = async () => {
        setIsLoading(true)
        try {
            const [usersRes, codesRes, waitlistRes] = await Promise.all([
                fetch('/api/admin/users'),
                fetch('/api/admin/invite-codes'),
                fetch('/api/admin/waitlist'),
            ])

            const [users, codes, waitlist] = await Promise.all([
                usersRes.ok ? usersRes.json() : [],
                codesRes.ok ? codesRes.json() : [],
                waitlistRes.ok ? waitlistRes.json() : [],
            ])

            setStats({
                totalUsers: users.length,
                adminUsers: users.filter((u: any) => u.systemRole === 'ADMIN').length,
                inviteCodes: codes.length,
                activeInviteCodes: codes.filter((c: any) => c.usedCount < c.maxUses).length,
                waitlistUsers: waitlist.length,
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            description: `${stats.adminUsers} admins`,
            icon: Users,
            href: '/admin/users',
            color: 'text-blue-500',
        },
        {
            title: 'Invite Codes',
            value: stats.inviteCodes,
            description: `${stats.activeInviteCodes} active`,
            icon: Ticket,
            href: '/admin/invite-codes',
            color: 'text-green-500',
        },
        {
            title: 'Waitlist',
            value: stats.waitlistUsers,
            description: 'users waiting',
            icon: UserPlus,
            href: '/admin/waitlist',
            color: 'text-purple-500',
        },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">Overview of your application.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {statCards.map((card) => (
                    <Link key={card.title} href={card.href}>
                        <Card className="hover:bg-accent transition-colors cursor-pointer">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {card.title}
                                </CardTitle>
                                <card.icon className={`h-4 w-4 ${card.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {isLoading ? '...' : card.value}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {card.description}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common administrative tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Link href="/admin/users">
                            <Button variant="outline" className="w-full justify-start">
                                <Users className="mr-2 h-4 w-4" />
                                Manage Users
                            </Button>
                        </Link>
                        <Link href="/admin/invite-codes">
                            <Button variant="outline" className="w-full justify-start">
                                <Ticket className="mr-2 h-4 w-4" />
                                Generate Invite Codes
                            </Button>
                        </Link>
                        <Link href="/admin/waitlist">
                            <Button variant="outline" className="w-full justify-start">
                                <UserPlus className="mr-2 h-4 w-4" />
                                View Waitlist
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest system updates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        System running smoothly
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        All services operational
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
