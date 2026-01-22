'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to our logging system
    logger.error('Application error caught by error boundary', error, {
      digest: error.digest,
    })
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="mb-4 text-4xl font-bold">Something went wrong!</h1>
        <p className="mb-4 text-muted-foreground">
          {error.message || 'An unexpected error occurred'}
        </p>
        {error.digest && (
          <p className="mb-4 text-xs text-muted-foreground font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-block rounded-md bg-primary px-6 py-3 text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-block rounded-md border border-border px-6 py-3 hover:bg-accent transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  )
}
