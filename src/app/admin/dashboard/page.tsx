'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus, RefreshCcw, Trash2 } from 'lucide-react'

export default function AdminDashboard() {
    const { toast } = useToast()
    const [activeTab, setActiveTab] = useState('codes')

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage invite codes and waitlist.</p>
                </div>
            </div>

            <Tabs defaultValue="codes" className="space-y-4" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="codes">Invite Codes</TabsTrigger>
                    <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
                </TabsList>

                <TabsContent value="codes" className="space-y-4">
                    <InviteCodesManager />
                </TabsContent>

                <TabsContent value="waitlist" className="space-y-4">
                    <WaitlistManager />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function InviteCodesManager() {
    const { toast } = useToast()
    const [codes, setCodes] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    const fetchCodes = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/invite-codes')
            if (res.ok) {
                const data = await res.json()
                setCodes(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchCodes()
    }, [])

    const generateCodes = async (count: number) => {
        setIsGenerating(true)
        try {
            const res = await fetch('/api/admin/invite-codes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count, maxUses: 1 }),
            })

            if (!res.ok) throw new Error('Failed to generate')

            toast({ title: `Generated ${count} codes` })
            fetchCodes()
        } catch (error) {
            toast({ title: 'Error generating codes', variant: 'destructive' })
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Invite Codes</CardTitle>
                        <CardDescription>Manage codes for user registration.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => fetchCodes()} disabled={isLoading}>
                            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button onClick={() => generateCodes(5)} disabled={isGenerating}>
                            <Plus className="mr-2 h-4 w-4" /> Generate 5
                        </Button>
                        <Button variant="secondary" onClick={() => generateCodes(10)} disabled={isGenerating}>
                            Generate 10
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Uses</TableHead>
                            <TableHead>Created At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {codes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                    No codes found. Generate some!
                                </TableCell>
                            </TableRow>
                        ) : (
                            codes.map((code) => (
                                <TableRow key={code.id}>
                                    <TableCell className="font-mono">{code.code}</TableCell>
                                    <TableCell>
                                        <Badge variant={code.usedCount >= code.maxUses ? 'secondary' : 'default'}>
                                            {code.usedCount >= code.maxUses ? 'Used' : 'Active'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{code.usedCount} / {code.maxUses}</TableCell>
                                    <TableCell>{new Date(code.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

function WaitlistManager() {
    const { toast } = useToast()
    const [users, setUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/waitlist')
            if (res.ok) {
                const data = await res.json()
                setUsers(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const removeUser = async (id: string) => {
        if (!confirm('Are you sure?')) return
        try {
            const res = await fetch(`/api/admin/waitlist?id=${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                toast({ title: 'User removed' })
                fetchUsers()
            }
        } catch (e) {
            toast({ title: 'Error', variant: 'destructive' })
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Waitlist</CardTitle>
                        <CardDescription>{users.length} users waiting.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => fetchUsers()} disabled={isLoading}>
                        <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Position</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Ref Count</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-bold">{user.position}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.referralCount}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{user.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => removeUser(user.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
