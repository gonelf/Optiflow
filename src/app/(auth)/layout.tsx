import { GradientBackground } from "@/components/landing/gradient-background"

export const dynamic = 'force-dynamic'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute inset-0">
        <GradientBackground />
      </div>
      <div className="w-full max-w-md relative z-10 p-4">{children}</div>
    </div>
  )
}
