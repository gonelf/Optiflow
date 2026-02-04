"use client"

import { motion } from "framer-motion"

const logos = [
    { name: "Acme Corp", logo: "https://v1.radix-ui.com/logo-acme.svg" },
    { name: "Global Tech", logo: "https://v1.radix-ui.com/logo-global.svg" },
    { name: "Apex Solutions", logo: "https://v1.radix-ui.com/logo-apex.svg" },
    { name: "Celestial", logo: "https://v1.radix-ui.com/logo-celestial.svg" },
    { name: "Starlight", logo: "https://v1.radix-ui.com/logo-starlight.svg" },
]

export function LogoCloud() {
    return (
        <section className="py-12 border-b border-white/5 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="container mx-auto px-4">
                <p className="text-center text-sm font-medium text-muted-foreground mb-8">
                    TRUSTED BY INNOVATIVE TEAMS WORLDWIDE
                </p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center">
                    {logos.map((logo, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="h-8 w-auto flex items-center justify-center grayscale"
                        >
                            {/* Using text placeholders since I don't have the real logos, but styled to look professional */}
                            <span className="text-xl font-bold tracking-tighter text-foreground/40">{logo.name}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
