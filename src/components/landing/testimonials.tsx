"use client"

import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"

const testimonials = [
    {
        quote: "Switched from Webflow + VWO and haven't looked back. Increased trial signups 34% in month one.",
        author: "Alex Kim",
        title: "Growth Lead, TechCo",
        initials: "AK"
    },
    {
        quote: "Finally! A builder that doesn't make me context-switch to run experiments. Our iteration speed has tripled.",
        author: "Sarah Martinez",
        title: "Founder, StartupX",
        initials: "SM"
    },
    {
        quote: "The integrated analytics are a game-changer. We see exactly which variants drive revenue, not just clicks.",
        author: "James Rodriguez",
        title: "Marketing Director, SaaSCo",
        initials: "JR"
    }
]

export function Testimonials() {
    return (
        <section className="py-24 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                    Loved by Growth Teams
                </h2>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                        >
                            <Card className="p-8 h-full bg-muted/20 border-border/50 hover:bg-muted/40 transition-colors">
                                <div className="flex text-primary mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                        </svg>
                                    ))}
                                </div>
                                <blockquote className="text-lg mb-6 leading-relaxed">
                                    &quot;{t.quote}&quot;
                                </blockquote>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3 text-primary font-bold text-sm">
                                        {t.initials}
                                    </div>
                                    <div>
                                        <div className="font-semibold">{t.author}</div>
                                        <div className="text-sm text-muted-foreground">{t.title}</div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
