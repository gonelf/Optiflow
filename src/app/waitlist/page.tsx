'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'
import { Copy, Check, Users, Sparkles } from 'lucide-react'

export default function WaitlistPage() {
    const searchParams = useSearchParams()
    const refCode = searchParams.get('ref')
    const { toast } = useToast()

    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [aheadCount, setAheadCount] = useState<number | null>(null)
    const [copied, setCopied] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, referredBy: refCode }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong')
            }

            setUser(data.user) // Expecting user object
            fetchPosition(data.user.email)

            toast({
                title: "You're on the list!",
                description: "We'll notify you when it's your turn.",
            })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const fetchPosition = async (emailToCheck: string) => {
        try {
            const res = await fetch(`/api/waitlist?email=${encodeURIComponent(emailToCheck)}`)
            if (res.ok) {
                const data = await res.json()
                setUser(data.user)
                setAheadCount(data.aheadCount)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const copyLink = () => {
        if (!user) return
        const link = `${window.location.origin}/waitlist?ref=${user.referralCode}`
        navigator.clipboard.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast({
            title: 'Copied!',
            description: 'Referral link copied to clipboard.',
        })
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4 dark:bg-gray-950/50">
            <Card className="w-full max-w-md border-border/50 shadow-lg backdrop-blur-sm">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">
                        {user ? 'You are on the list!' : 'Join the Waitlist'}
                    </CardTitle>
                    <CardDescription className="text-base">
                        {user
                            ? `You are #${user.position} in line.`
                            : 'OptiFlow is currently in private beta. Reserve your spot today.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!user ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    required
                                    className="h-11"
                                />
                            </div>
                            <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
                                {isLoading ? 'Joining...' : 'Join Waitlist'}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="rounded-lg bg-muted/50 p-4 text-center">
                                <div className="text-sm font-medium text-muted-foreground mb-1">Your Position</div>
                                <div className="text-4xl font-bold text-primary">{user.position}</div>
                                {aheadCount !== null && (
                                    <div className="text-xs text-muted-foreground mt-2">
                                        {aheadCount === 0 ? "You're next!" : `${aheadCount} people ahead of you`}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="text-center text-sm font-medium">
                                    Refer friends to move up the list!
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        readOnly
                                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/waitlist?ref=${user.referralCode}`}
                                        className="font-mono text-xs"
                                    />
                                    <Button size="icon" variant="outline" onClick={copyLink}>
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground text-center">
                                    For every friend who joins using your link, you'll drop one spot in line.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Background decoration */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        </div>
    )
}
