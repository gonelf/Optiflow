"use client"

import Link from "next/link"
import Image from "next/image"

export function Footer() {
    return (
        <footer className="bg-background border-t border-border/40 py-12 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
                    <div className="col-span-2 lg:col-span-2">
                        <Link href="/" className="flex items-center space-x-2 mb-6">
                            <Image src="/logo.svg" alt="Reoptimize" width={32} height={32} className="h-8 w-8" />
                            <span className="text-xl font-bold">Reoptimize</span>
                        </Link>
                        <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                            The only visual page builder with native A/B testing and revenue analytics. Build for conversion, not just for looks.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-foreground/70">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
                            <li><Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
                            <li><Link href="/templates" className="text-muted-foreground hover:text-primary transition-colors">Templates</Link></li>
                            <li><Link href="/integrations" className="text-muted-foreground hover:text-primary transition-colors">Integrations</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-foreground/70">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
                            <li><Link href="/careers" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
                            <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-foreground/70">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>© 2026 Reoptimize Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-foreground transition-colors">Twitter</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">LinkedIn</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">GitHub</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
