import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold">404</h1>
        <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
        <p className="mb-8 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-block rounded-md bg-primary px-6 py-3 text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
