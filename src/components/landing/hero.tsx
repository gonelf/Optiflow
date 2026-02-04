"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, Play, Sparkles } from "lucide-react"
import Link from "next/link"
import { GradientBackground } from "./gradient-background"
import { PageEditor } from "@/components/builder/PageEditor"
import { ExtendedElement } from "@/components/builder/Canvas"
import { useState } from "react"

export function Hero() {
    const [elements, setElements] = useState<ExtendedElement[]>([
        // Hero Section
        {
            id: "hero-section",
            type: "container",
            name: "Hero Section",
            pageId: "demo",
            order: 0,
            depth: 0,
            path: "hero-section",
            content: { tagName: "section" },
            styles: {
                padding: "60px 40px",
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)",
                borderRadius: "20px",
                border: "1px solid rgba(148, 163, 184, 0.1)",
                backdropFilter: "blur(12px)"
            },
            className: "",
            parentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            children: [
                {
                    id: "hero-badge",
                    type: "container",
                    name: "Badge",
                    pageId: "demo",
                    order: 0,
                    depth: 1,
                    path: "hero-section/hero-badge",
                    content: { tagName: "div" },
                    styles: {
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 16px",
                        background: "rgba(59, 130, 246, 0.1)",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        borderRadius: "50px",
                        marginBottom: "24px"
                    },
                    className: "",
                    parentId: "hero-section",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    children: [
                        {
                            id: "badge-text",
                            type: "text",
                            name: "Badge Text",
                            pageId: "demo",
                            order: 0,
                            depth: 2,
                            path: "hero-section/hero-badge/badge-text",
                            content: { tagName: "span", content: "✨ New: AI-Powered Analytics" },
                            styles: {
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#60a5fa"
                            },
                            className: "",
                            parentId: "hero-badge",
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        }
                    ]
                },
                {
                    id: "hero-title",
                    type: "text",
                    name: "Hero Title",
                    pageId: "demo",
                    order: 1,
                    depth: 1,
                    path: "hero-section/hero-title",
                    content: { tagName: "h1", content: "Elevate Your Workflow" },
                    styles: {
                        fontSize: "56px",
                        fontWeight: "800",
                        background: "linear-gradient(135deg, #60a5fa 0%, #a855f7 50%, #ec4899 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        lineHeight: "1.1",
                        marginBottom: "20px"
                    },
                    className: "",
                    parentId: "hero-section",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: "hero-subtitle",
                    type: "text",
                    name: "Hero Subtitle",
                    pageId: "demo",
                    order: 2,
                    depth: 1,
                    path: "hero-section/hero-subtitle",
                    content: { tagName: "p", content: "Transform your business with cutting-edge tools designed for modern teams. Build faster, scale smarter, and deliver exceptional results." },
                    styles: {
                        fontSize: "20px",
                        color: "#cbd5e1",
                        lineHeight: "1.6",
                        maxWidth: "600px",
                        marginBottom: "32px"
                    },
                    className: "",
                    parentId: "hero-section",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: "hero-cta-group",
                    type: "container",
                    name: "CTA Buttons",
                    pageId: "demo",
                    order: 3,
                    depth: 1,
                    path: "hero-section/hero-cta-group",
                    content: { tagName: "div" },
                    styles: {
                        display: "flex",
                        gap: "16px",
                        flexWrap: "wrap"
                    },
                    className: "",
                    parentId: "hero-section",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    children: [
                        {
                            id: "hero-primary-btn",
                            type: "button",
                            name: "Primary CTA",
                            pageId: "demo",
                            order: 0,
                            depth: 2,
                            path: "hero-section/hero-cta-group/hero-primary-btn",
                            content: { content: "Start Free Trial" },
                            styles: {
                                padding: "16px 32px",
                                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                                color: "white",
                                border: "none",
                                borderRadius: "12px",
                                fontSize: "16px",
                                fontWeight: "600",
                                cursor: "pointer",
                                boxShadow: "0 10px 40px rgba(59, 130, 246, 0.3)"
                            },
                            className: "",
                            parentId: "hero-cta-group",
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                        {
                            id: "hero-secondary-btn",
                            type: "button",
                            name: "Secondary CTA",
                            pageId: "demo",
                            order: 1,
                            depth: 2,
                            path: "hero-section/hero-cta-group/hero-secondary-btn",
                            content: { content: "Watch Demo" },
                            styles: {
                                padding: "16px 32px",
                                background: "rgba(255, 255, 255, 0.05)",
                                color: "#e2e8f0",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                borderRadius: "12px",
                                fontSize: "16px",
                                fontWeight: "600",
                                cursor: "pointer"
                            },
                            className: "",
                            parentId: "hero-cta-group",
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        }
                    ]
                }
            ]
        },
        // Features Section
        {
            id: "features-section",
            type: "container",
            name: "Features Section",
            pageId: "demo",
            order: 1,
            depth: 0,
            path: "features-section",
            content: { tagName: "section" },
            styles: {
                padding: "40px",
                marginTop: "32px",
                background: "rgba(15, 23, 42, 0.5)",
                borderRadius: "20px",
                border: "1px solid rgba(148, 163, 184, 0.1)"
            },
            className: "",
            parentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            children: [
                {
                    id: "features-header",
                    type: "text",
                    name: "Features Title",
                    pageId: "demo",
                    order: 0,
                    depth: 1,
                    path: "features-section/features-header",
                    content: { tagName: "h2", content: "Powerful Features" },
                    styles: {
                        fontSize: "36px",
                        fontWeight: "700",
                        color: "#f1f5f9",
                        textAlign: "center",
                        marginBottom: "40px"
                    },
                    className: "",
                    parentId: "features-section",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: "features-grid",
                    type: "container",
                    name: "Features Grid",
                    pageId: "demo",
                    order: 1,
                    depth: 1,
                    path: "features-section/features-grid",
                    content: { tagName: "div" },
                    styles: {
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "24px"
                    },
                    className: "",
                    parentId: "features-section",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    children: [
                        {
                            id: "feature-card-1",
                            type: "container",
                            name: "Feature Card 1",
                            pageId: "demo",
                            order: 0,
                            depth: 2,
                            path: "features-section/features-grid/feature-card-1",
                            content: { tagName: "div" },
                            styles: {
                                padding: "32px",
                                background: "rgba(255, 255, 255, 0.03)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                borderRadius: "16px",
                                backdropFilter: "blur(12px)"
                            },
                            className: "",
                            parentId: "features-grid",
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            children: [
                                {
                                    id: "feature-1-icon",
                                    type: "text",
                                    name: "Icon",
                                    pageId: "demo",
                                    order: 0,
                                    depth: 3,
                                    path: "features-section/features-grid/feature-card-1/feature-1-icon",
                                    content: { tagName: "div", content: "⚡" },
                                    styles: {
                                        fontSize: "40px",
                                        marginBottom: "16px"
                                    },
                                    className: "",
                                    parentId: "feature-card-1",
                                    createdAt: new Date(),
                                    updatedAt: new Date(),
                                },
                                {
                                    id: "feature-1-title",
                                    type: "text",
                                    name: "Title",
                                    pageId: "demo",
                                    order: 1,
                                    depth: 3,
                                    path: "features-section/features-grid/feature-card-1/feature-1-title",
                                    content: { tagName: "h3", content: "Lightning Fast" },
                                    styles: {
                                        fontSize: "20px",
                                        fontWeight: "600",
                                        color: "#f1f5f9",
                                        marginBottom: "12px"
                                    },
                                    className: "",
                                    parentId: "feature-card-1",
                                    createdAt: new Date(),
                                    updatedAt: new Date(),
                                },
                                {
                                    id: "feature-1-desc",
                                    type: "text",
                                    name: "Description",
                                    pageId: "demo",
                                    order: 2,
                                    depth: 3,
                                    path: "features-section/features-grid/feature-card-1/feature-1-desc",
                                    content: { tagName: "p", content: "Optimized performance that scales with your needs" },
                                    styles: {
                                        fontSize: "15px",
                                        color: "#e2e8f0",
                                        lineHeight: "1.6"
                                    },
                                    className: "",
                                    parentId: "feature-card-1",
                                    createdAt: new Date(),
                                    updatedAt: new Date(),
                                }
                            ]
                        },
                        {
                            id: "feature-card-2",
                            type: "container",
                            name: "Feature Card 2",
                            pageId: "demo",
                            order: 1,
                            depth: 2,
                            path: "features-section/features-grid/feature-card-2",
                            content: { tagName: "div" },
                            styles: {
                                padding: "32px",
                                background: "rgba(255, 255, 255, 0.03)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                borderRadius: "16px",
                                backdropFilter: "blur(12px)"
                            },
                            className: "",
                            parentId: "features-grid",
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            children: [
                                {
                                    id: "feature-2-icon",
                                    type: "text",
                                    name: "Icon",
                                    pageId: "demo",
                                    order: 0,
                                    depth: 3,
                                    path: "features-section/features-grid/feature-card-2/feature-2-icon",
                                    content: { tagName: "div", content: "🔒" },
                                    styles: {
                                        fontSize: "40px",
                                        marginBottom: "16px"
                                    },
                                    className: "",
                                    parentId: "feature-card-2",
                                    createdAt: new Date(),
                                    updatedAt: new Date(),
                                },
                                {
                                    id: "feature-2-title",
                                    type: "text",
                                    name: "Title",
                                    pageId: "demo",
                                    order: 1,
                                    depth: 3,
                                    path: "features-section/features-grid/feature-card-2/feature-2-title",
                                    content: { tagName: "h3", content: "Secure by Default" },
                                    styles: {
                                        fontSize: "20px",
                                        fontWeight: "600",
                                        color: "#f1f5f9",
                                        marginBottom: "12px"
                                    },
                                    className: "",
                                    parentId: "feature-card-2",
                                    createdAt: new Date(),
                                    updatedAt: new Date(),
                                },
                                {
                                    id: "feature-2-desc",
                                    type: "text",
                                    name: "Description",
                                    pageId: "demo",
                                    order: 2,
                                    depth: 3,
                                    path: "features-section/features-grid/feature-card-2/feature-2-desc",
                                    content: { tagName: "p", content: "Enterprise-grade security protecting your data" },
                                    styles: {
                                        fontSize: "15px",
                                        color: "#e2e8f0",
                                        lineHeight: "1.6"
                                    },
                                    className: "",
                                    parentId: "feature-card-2",
                                    createdAt: new Date(),
                                    updatedAt: new Date(),
                                }
                            ]
                        },
                        {
                            id: "feature-card-3",
                            type: "container",
                            name: "Feature Card 3",
                            pageId: "demo",
                            order: 2,
                            depth: 2,
                            path: "features-section/features-grid/feature-card-3",
                            content: { tagName: "div" },
                            styles: {
                                padding: "32px",
                                background: "rgba(255, 255, 255, 0.03)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                borderRadius: "16px",
                                backdropFilter: "blur(12px)"
                            },
                            className: "",
                            parentId: "features-grid",
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            children: [
                                {
                                    id: "feature-3-icon",
                                    type: "text",
                                    name: "Icon",
                                    pageId: "demo",
                                    order: 0,
                                    depth: 3,
                                    path: "features-section/features-grid/feature-card-3/feature-3-icon",
                                    content: { tagName: "div", content: "🎨" },
                                    styles: {
                                        fontSize: "40px",
                                        marginBottom: "16px"
                                    },
                                    className: "",
                                    parentId: "feature-card-3",
                                    createdAt: new Date(),
                                    updatedAt: new Date(),
                                },
                                {
                                    id: "feature-3-title",
                                    type: "text",
                                    name: "Title",
                                    pageId: "demo",
                                    order: 1,
                                    depth: 3,
                                    path: "features-section/features-grid/feature-card-3/feature-3-title",
                                    content: { tagName: "h3", content: "Beautiful Design" },
                                    styles: {
                                        fontSize: "20px",
                                        fontWeight: "600",
                                        color: "#f1f5f9",
                                        marginBottom: "12px"
                                    },
                                    className: "",
                                    parentId: "feature-card-3",
                                    createdAt: new Date(),
                                    updatedAt: new Date(),
                                },
                                {
                                    id: "feature-3-desc",
                                    type: "text",
                                    name: "Description",
                                    pageId: "demo",
                                    order: 2,
                                    depth: 3,
                                    path: "features-section/features-grid/feature-card-3/feature-3-desc",
                                    content: { tagName: "p", content: "Stunning interfaces that users love to interact with" },
                                    styles: {
                                        fontSize: "15px",
                                        color: "#e2e8f0",
                                        lineHeight: "1.6"
                                    },
                                    className: "",
                                    parentId: "feature-card-3",
                                    createdAt: new Date(),
                                    updatedAt: new Date(),
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        // CTA Section
        {
            id: "cta-section",
            type: "container",
            name: "CTA Section",
            pageId: "demo",
            order: 2,
            depth: 0,
            path: "cta-section",
            content: { tagName: "section" },
            styles: {
                padding: "60px 40px",
                marginTop: "32px",
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)",
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                borderRadius: "20px",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                textAlign: "center"
            },
            className: "",
            parentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            children: [
                {
                    id: "cta-title",
                    type: "text",
                    name: "CTA Title",
                    pageId: "demo",
                    order: 0,
                    depth: 1,
                    path: "cta-section/cta-title",
                    content: { tagName: "h2", content: "Ready to Get Started?" },
                    styles: {
                        fontSize: "40px",
                        fontWeight: "700",
                        color: "#f1f5f9",
                        marginBottom: "16px"
                    },
                    className: "",
                    parentId: "cta-section",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: "cta-subtitle",
                    type: "text",
                    name: "CTA Subtitle",
                    pageId: "demo",
                    order: 1,
                    depth: 1,
                    path: "cta-section/cta-subtitle",
                    content: { tagName: "p", content: "Join thousands of teams already using our platform" },
                    styles: {
                        fontSize: "18px",
                        color: "#f1f5f9",
                        marginBottom: "32px"
                    },
                    className: "",
                    parentId: "cta-section",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: "cta-button",
                    type: "button",
                    name: "CTA Button",
                    pageId: "demo",
                    order: 2,
                    depth: 1,
                    path: "cta-section/cta-button",
                    content: { content: "Get Started Now →" },
                    styles: {
                        padding: "18px 40px",
                        background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "18px",
                        fontWeight: "600",
                        cursor: "pointer",
                        boxShadow: "0 10px 40px rgba(59, 130, 246, 0.4)"
                    },
                    className: "",
                    parentId: "cta-section",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            ]
        }
    ] as any[]);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-48 overflow-hidden bg-background">
            <div id="hero-background" className="absolute inset-0 -skew-y-6 origin-top-left overflow-hidden h-[120%]">
                <GradientBackground />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center rounded-full border-2 border-primary/20 bg-white/70 backdrop-blur-md px-4 py-1.5 text-sm font-semibold text-primary mb-8"
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
                        Build, Test & Track <br />
                        <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                            Without the Dev Team
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl md:text-2xl text-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed"
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
                                Join the Waitlist
                                <ArrowRight className="ml-2 h-5 w-5" />
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
                                reoptimize.xyz/editor
                            </div>
                        </div>

                        {/* Content Mockup - Now a real PageEditor */}
                        <div className="h-[500px] md:h-[650px] relative">
                            <PageEditor
                                elements={elements}
                                setElements={setElements}
                                selectedElementId={selectedElementId}
                                setSelectedElementId={setSelectedElementId}
                                pageId="demo"
                                showAI={false}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
