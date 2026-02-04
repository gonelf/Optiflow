'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Lock, AlertCircle } from 'lucide-react'

export default function AccountSettings() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [hasPassword, setHasPassword] = useState(true)
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })

    // Redirect if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    // Check if user has a password (not OAuth-only)
    useEffect(() => {
        const checkPasswordStatus = async () => {
            try {
                const res = await fetch('/api/user/profile')
                if (res.ok) {
                    const data = await res.json()
                    setHasPassword(!!data.hasPassword)
                }
            } catch (error) {
                console.error('Failed to check password status:', error)
            }
        }

        if (status === 'authenticated') {
            checkPasswordStatus()
        }
    }, [status])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Client-side validation
        if (formData.newPassword !== formData.confirmPassword) {
            toast({
                title: 'Passwords do not match',
                description: 'Please make sure both passwords are identical.',
                variant: 'destructive',
            })
            return
        }

        if (formData.newPassword.length < 8) {
            toast({
                title: 'Password too short',
                description: 'New password must be at least 8 characters long.',
                variant: 'destructive',
            })
            return
        }

        if (formData.currentPassword === formData.newPassword) {
            toast({
                title: 'Same password',
                description: 'New password must be different from current password.',
                variant: 'destructive',
            })
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('/api/user/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: data.message || 'Password changed successfully',
                })
                // Clear form
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                })
            } else {
                toast({
                    title: 'Error',
                    description: data.message || 'Failed to change password',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Something went wrong. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (status === 'loading') {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences and security</p>
            </div>

            {/* Account Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={session?.user?.email || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={session?.user?.name || ''} disabled />
                    </div>
                </CardContent>
            </Card>

            {/* Password Change */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Change Password
                    </CardTitle>
                    <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent>
                    {!hasPassword ? (
                        <div className="rounded-lg bg-muted p-4 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium">OAuth Account</p>
                                <p className="text-sm text-muted-foreground">
                                    You signed in using a social login provider (Google or GitHub). Password changes
                                    are not available for OAuth accounts. To manage your account security, please use
                                    your provider&apos;s settings.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    disabled={isLoading}
                                    required
                                    minLength={8}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Must be at least 8 characters long
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    disabled={isLoading}
                                    required
                                    minLength={8}
                                />
                            </div>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Changing Password...' : 'Change Password'}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
