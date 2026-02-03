'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'
import { Copy, Check, Users, Twitter, Linkedin, Mail } from 'lucide-react'

function WaitlistContent() {
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
                    <div className="mx-auto mb-4 flex items-center justify-center">
                        <img src="/logo.svg" alt="Reoptimize" className="h-16 w-auto" />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">
                        {user ? 'You are on the list!' : 'Join the Waitlist'}
                    </CardTitle>
                    <CardDescription className="text-base">
                        {user
                            ? `You are #${user.position} in line.`
                            : 'Reoptimize is currently in private beta. Reserve your spot today.'}
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
                            <div className="text-center text-sm">
                                <span className="text-muted-foreground">Already have an invite code? </span>
                                <a href="/signup" className="text-primary hover:underline font-medium">
                                    Register here
                                </a>
                            </div>
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
                                    For every friend who joins using your link, you&apos;ll drop one spot in line.
                                </p>

                                <div className="text-center text-sm font-medium pt-2">
                                    Share on social media
                                </div>

                                <div className="grid grid-cols-3 gap-3 pt-2">
                                    <Button variant="outline" className="gap-2" onClick={() => {
                                        const shareUrl = `${window.location.origin}/waitlist?ref=${user.referralCode}`
                                        const text = "I just joined the waiting list for Reoptimize! Secure your spot now."
                                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
                                    }} title="Share on Twitter">
                                        <TwitterIcon className="h-4 w-4" />
                                        Twitter
                                    </Button>
                                    <Button variant="outline" className="gap-2" onClick={() => {
                                        const shareUrl = `${window.location.origin}/waitlist?ref=${user.referralCode}`
                                        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')
                                    }} title="Share on LinkedIn">
                                        <LinkedinIcon className="h-4 w-4" />
                                        LinkedIn
                                    </Button>
                                    <Button variant="outline" className="gap-2" onClick={() => {
                                        const shareUrl = `${window.location.origin}/waitlist?ref=${user.referralCode}`
                                        const text = "I just joined the waiting list for Reoptimize! Secure your spot now."
                                        window.open(`mailto:?subject=${encodeURIComponent("Join me on Reoptimize")}&body=${encodeURIComponent(text + "\n\n" + shareUrl)}`, '_blank')
                                    }} title="Share via Email">
                                        <MailIcon className="h-4 w-4" />
                                        Email
                                    </Button>
                                </div>
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


export default function WaitlistPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WaitlistContent />
        </Suspense>
    )
}

function TwitterIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
        </svg>
    )
}

function LinkedinIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect width="4" height="12" x="2" y="9" />
            <circle cx="4" cy="4" r="2" />
        </svg>
    )
}

function MailIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
    )
}
