"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function CTA() {
    return (
        <section className="py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative rounded-3xl overflow-hidden bg-primary px-6 py-20 text-center shadow-2xl"
                >
                    {/* Background decorative circles */}
                    <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-black/10 rounded-full blur-3xl" />

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
                            Ready to Stop Guessing?
                        </h2>
                        <p className="text-xl text-primary-foreground/80 mb-10">
                            Join thousands of marketers shipping winning experiments every week.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/waitlist">
                                <Button size="lg" variant="secondary" className="h-14 px-8 text-lg w-full sm:w-auto">
                                    Start Free Trial
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/demo">
                                <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-transparent text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10 w-full sm:w-auto">
                                    Book a Demo
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
