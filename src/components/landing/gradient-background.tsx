"use client"

import { motion } from "framer-motion"

export function GradientBackground() {
    return (
        <div id="landing-gradient-bg" className="absolute inset-0 overflow-hidden pointer-events-none bg-white">
            {/* Mesh Gradient Blobs - High Visibility Logo Colors */}

            {/* Yellow Blob */}
            <motion.div
                animate={{
                    x: [-150, 250, -150],
                    y: [-80, 150, -80],
                    rotate: [0, 45, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                style={{ backgroundColor: '#f6c344' }}
                className="absolute top-[0%] left-[-10%] w-[80%] h-[80%] rounded-full blur-[80px] opacity-[0.6] will-change-transform"
            />

            {/* Lime Blob */}
            <motion.div
                animate={{
                    x: [150, -250, 150],
                    y: [80, 180, 80],
                    rotate: [0, -45, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                style={{ backgroundColor: '#a3d162' }}
                className="absolute top-[10%] right-[-20%] w-[70%] h-[70%] rounded-full blur-[80px] opacity-[0.6] will-change-transform"
            />

            {/* Sky Blue Blob */}
            <motion.div
                animate={{
                    x: [-80, 200, -80],
                    y: [180, -120, 180],
                    rotate: [0, 30, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                style={{ backgroundColor: '#5fb6e4' }}
                className="absolute bottom-[-20%] left-[0%] w-[85%] h-[85%] rounded-full blur-[80px] opacity-[0.7] will-change-transform"
            />

            {/* Indigo Blob */}
            <motion.div
                animate={{
                    x: [200, -150, 200],
                    y: [-80, 100, -80],
                    rotate: [0, -30, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 14,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                style={{ backgroundColor: '#3b468a' }}
                className="absolute bottom-[5%] right-[-10%] w-[65%] h-[65%] rounded-full blur-[80px] opacity-[0.6] will-change-transform"
            />

            {/* Rose Blob */}
            <motion.div
                animate={{
                    x: [0, 250, 0],
                    y: [0, -200, 0],
                    rotate: [0, 60, 0],
                    scale: [1, 1.15, 1],
                }}
                transition={{
                    duration: 13,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                style={{ backgroundColor: '#d84b86' }}
                className="absolute top-[15%] left-[15%] w-[60%] h-[60%] rounded-full blur-[80px] opacity-[0.5] will-change-transform"
            />

            {/* Noise Overlay for texture */}
            <div className="absolute inset-0 opacity-[0.12] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    )
}
