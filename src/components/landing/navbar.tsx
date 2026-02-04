"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function Navbar() {
    const { scrollY } = useScroll()
    const [isScrolled, setIsScrolled] = useState(false)

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50)
    })

    return (
        <motion.nav
            className={cn(
                "fixed top-4 left-0 right-0 z-50 transition-all duration-300 mx-auto max-w-7xl px-4",
            )}
        >
            <div className={cn(
                "rounded-full border transition-all duration-300 backdrop-blur-md px-6 h-16 flex items-center justify-between",
                isScrolled
                    ? "bg-background/80 border-border shadow-lg"
                    : "bg-transparent border-transparent"
            )}>
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center space-x-2">
                        <Image src="/logo.svg" alt="Reoptimize" width={32} height={32} className="h-8 w-8" />
                        <span className="text-xl font-bold hidden md:inline-block">Reoptimize</span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Features
                        </Link>
                        <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Pricing
                        </Link>
                        <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Blog
                        </Link>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors hidden md:block">
                        Log in
                    </Link>
                    <Link href="/waitlist">
                        <Button size="sm" className="rounded-full px-6">
                            Join the Waitlist
                        </Button>
                    </Link>
                </div>
            </div>
        </motion.nav>
    )
}
