'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export const dynamic = 'force-dynamic'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setEmailSent(true)
        toast({
          title: 'Email sent',
          description: data.message,
        })
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Something went wrong',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reset email. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent password reset instructions to your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p>
              If an account exists with <strong>{email}</strong>, you will receive a password
              reset link shortly.
            </p>
            <p className="mt-2">
              The link will expire in 1 hour for security reasons.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setEmailSent(false)}
          >
            Resend email
          </Button>
          <p className="text-sm text-muted-foreground text-center w-full">
            Remember your password?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </p>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground text-center w-full">
          Remember your password?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
