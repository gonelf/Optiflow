"use client"

import { motion } from "framer-motion"

const stats = [
    { value: "10-50%", label: "Avg. Conversion Lift" },
    { value: "3x", label: "Faster Iterations" },
    { value: "$0", label: "Extra Tool Costs" },
    { value: "1", label: "Unified Platform" },
]

export function Stats() {
    return (
        <section className="border-y border-white/5 bg-muted/20 backdrop-blur-sm py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-4"
                        >
                            <div className="text-4xl md:text-5xl font-bold text-primary mb-2 tracking-tight">
                                {stat.value}
                            </div>
                            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
