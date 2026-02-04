"use client"

import { motion } from "framer-motion"

export function GradientBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
            {/* Mesh Gradient Blobs */}
            <motion.div
                animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px]"
            />

            <motion.div
                animate={{
                    x: [0, -80, 0],
                    y: [0, 100, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-[10%] right-[-5%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px]"
            />

            <motion.div
                animate={{
                    x: [0, 50, 0],
                    y: [0, -100, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-pink-500/20 rounded-full blur-[120px]"
            />

            <motion.div
                animate={{
                    x: [0, -120, 0],
                    y: [0, 60, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-[40%] left-[-5%] w-[40%] h-[40%] bg-orange-500/15 rounded-full blur-[120px]"
            />

            {/* Optional: Subtle grid overlay that stripes sometimes uses */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-[0.03] mix-blend-overlay" />

            {/* Noise Overlay */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    )
}
