export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold">OptiFlow</h1>
        <p className="mb-8 text-xl text-muted-foreground">
          No-Code SaaS Marketing Site Builder with Native A/B Testing & Analytics
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="rounded-md bg-primary px-6 py-3 text-primary-foreground hover:opacity-90"
          >
            Get Started
          </a>
          <a
            href="/docs"
            className="rounded-md border border-border px-6 py-3 hover:bg-accent"
          >
            Documentation
          </a>
        </div>
      </div>
    </main>
  )
}
