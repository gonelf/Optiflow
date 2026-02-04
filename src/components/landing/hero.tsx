"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, Play, Sparkles } from "lucide-react"
import Link from "next/link"

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[100px] -z-10 opacity-50" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] -z-10" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8"
                    >
                        <Sparkles className="mr-2 h-4 w-4" />
                        The Webflow Killer for Marketing Teams
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70"
                    >
                        Build, Test, & Win <br />
                        <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                            Without the Dev Team
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Replace your fragmented stack. Build with vibe code, run native A/B tests, and track revenue impact in one unified platform.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <Link href="/waitlist">
                            <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                                Start Building Free
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="#features">
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-muted/50">
                                <Play className="mr-2 h-4 w-4 fill-current" />
                                How it Works
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {/* 3D Dashboard Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40, rotateX: 20 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
                    className="relative max-w-5xl mx-auto perspective-1000"
                >
                    <div className="relative rounded-xl border bg-background/50 backdrop-blur-xl shadow-2xl shadow-primary/10 overflow-hidden transform-gpu transition-all duration-500 hover:-translate-y-2">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />

                        {/* Browser Interface Mockup */}
                        <div className="border-b bg-muted/40 p-4 flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            </div>
                            <div className="mx-auto bg-background/50 rounded-md px-3 py-1 text-xs text-muted-foreground w-64 text-center">
                                app.reoptimize.io/editor
                            </div>
                        </div>

                        {/* Content Mockup */}
                        <div className="p-8 md:p-12 min-h-[400px] md:min-h-[600px] flex flex-col items-center justify-center bg-grid-white/5 relative">
                            {/* Just a visual representation of the builder interface */}
                            <div className="w-full max-w-3xl border border-dashed border-primary/20 rounded-lg p-8 bg-background/40 relative">
                                <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">Selected: Hero Section</div>
                                <div className="space-y-4">
                                    <div className="h-12 w-3/4 bg-primary/10 rounded animate-pulse" />
                                    <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                                    <div className="flex gap-4 mt-8">
                                        <div className="h-10 w-32 bg-primary rounded animate-pulse" />
                                        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
                                    </div>
                                </div>

                                {/* Floating Action Menu Mockup */}
                                <div className="absolute -right-12 top-0 flex flex-col gap-2 p-2 bg-background border rounded-lg shadow-lg">
                                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">A</div>
                                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">B</div>
                                    <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center font-bold">+</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
