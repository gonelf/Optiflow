"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { BarChart3, Code2, Layers, Sparkles, TrendingUp, Zap } from "lucide-react"

const features = [
    {
        icon: Code2,
        title: "Vibe Code Builder",
        description: "Visual editor that generates clean, semantic code. No lock-in, just pure velocity.",
        className: "md:col-span-2",
    },
    {
        icon: Zap,
        title: "Native A/B Testing",
        description: "Launch experiments in clicks. Traffic splitting and stats built-in.",
        className: "",
    },
    {
        icon: BarChart3,
        title: "Revenue Analytics",
        description: "Connect revenue data to see which variants actually make money.",
        className: "",
    },
    {
        icon: Sparkles,
        title: "AI Optimization",
        description: "Get smart suggestions to improve conversion rates automatically.",
        className: "md:col-span-2",
    },
]

export function Features() {
    return (
        <section id="features" className="py-24 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        Everything You Need to Grow
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Stop paying for 5 different tools. We bundled the best of Webflow, VWO, and Mixpanel.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={feature.className}
                        >
                            <Card className="h-full p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-background/50 backdrop-blur border-primary/10">
                                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-6">
                                    <feature.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
