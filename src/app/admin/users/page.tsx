'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { RefreshCcw, Trash2, Shield, User } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface UserData {
    id: string
    email: string
    name: string | null
    systemRole: 'USER' | 'ADMIN'
    createdAt: string
    updatedAt: string
    onboarded: boolean
    _count: {
        workspaces: number
        pages: number
    }
}

export default function UsersPage() {
    const { toast } = useToast()
    const [users, setUsers] = useState<UserData[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null)

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/users')
            if (res.ok) {
                const data = await res.json()
                setUsers(data)
            } else {
                toast({ title: 'Failed to fetch users', variant: 'destructive' })
            }
        } catch (error) {
            console.error(error)
            toast({ title: 'Error fetching users', variant: 'destructive' })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const updateUserRole = async (userId: string, newRole: 'USER' | 'ADMIN') => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, systemRole: newRole }),
            })

            if (!res.ok) throw new Error('Failed to update')

            toast({ title: 'User role updated successfully' })
            fetchUsers()
        } catch (error) {
            toast({ title: 'Error updating user role', variant: 'destructive' })
        }
    }

    const deleteUser = async (userId: string) => {
        try {
            const res = await fetch(`/api/admin/users?id=${userId}`, {
                method: 'DELETE'
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || 'Failed to delete')
            }

            toast({ title: 'User deleted successfully' })
            fetchUsers()
        } catch (error: any) {
            toast({
                title: error.message || 'Error deleting user',
                variant: 'destructive'
            })
        } finally {
            setDeleteUserId(null)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">Manage users and their roles.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>All Users</CardTitle>
                            <CardDescription>{users.length} users registered.</CardDescription>
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
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Workspaces</TableHead>
                                <TableHead>Pages</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                        {isLoading ? 'Loading...' : 'No users found.'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.name || 'N/A'}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={user.systemRole}
                                                onValueChange={(value) => updateUserRole(user.id, value as 'USER' | 'ADMIN')}
                                            >
                                                <SelectTrigger className="w-[120px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="USER">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4" />
                                                            User
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="ADMIN">
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="h-4 w-4 text-red-500" />
                                                            Admin
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>{user._count.workspaces}</TableCell>
                                        <TableCell>{user._count.pages}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.onboarded ? 'default' : 'secondary'}>
                                                {user.onboarded ? 'Active' : 'Pending'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeleteUserId(user.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={deleteUserId !== null} onOpenChange={() => setDeleteUserId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the user and all their associated data. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteUserId && deleteUser(deleteUserId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
