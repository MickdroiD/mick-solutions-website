'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Mail, Linkedin, Github, Instagram } from 'lucide-react';
import type { FooterSectionProps } from '../../types';
import { hexToRgb } from '@/features/sections/effects-renderer';
import AnimatedLogoFrame from '@/shared/components/visuals/AnimatedLogoFrame';
import AnimatedMedia from '@/shared/components/visuals/AnimatedMedia';

export default function FooterElectric({ content: config, design }: FooterSectionProps) {
    const currentYear = new Date().getFullYear();

    const socialLinks = [
        { icon: Linkedin, url: config.lienLinkedin, label: 'LinkedIn' },
        { icon: Github, url: config.lienGithub, label: 'GitHub' },
        { icon: Instagram, url: config.lienInstagram, label: 'Instagram' },
    ].filter(s => s.url);

    // Effects
    const animationStyle = config.animationStyle || 'mick-electric';
    const forceElectricEffect = ['mick-electric', 'Mick Electric'].includes(animationStyle);

    const footerBgColor = config.footerBgColor || null;
    const footerTextColor = config.footerTextColor || null;

    // Font styles stub
    const titleFontFamily = 'var(--font-heading)';
    const bodyFontFamily = 'var(--font-primary)';

    return (
        <footer
            className="relative overflow-hidden"
            style={{
                backgroundColor: footerBgColor
                    ? `rgba(${hexToRgb(footerBgColor) || '15, 23, 42'}, 1)`
                    : undefined,
                color: footerTextColor || undefined,
            }}
        >
            {/* Gradient Background Fallback */}
            {!footerBgColor && (
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-slate-900/50 to-[#0a0a0f] pointer-events-none" />
            )}

            {!footerBgColor && (
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(to right, #22d3ee 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                    }}
                />
            )}

            <div className="relative max-w-7xl mx-auto px-6 py-20">
                {/* CTA */}
                {config.footerCtaText && (
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">{config.footerCtaText}</h2>
                        {config.footerCtaUrl && (
                            <a href={config.footerCtaUrl} className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:scale-105 transition-transform">
                                {config.ctaPrincipal || "Start Now"} <ArrowRight className="w-5 h-5" />
                            </a>
                        )}
                    </div>
                )}

                {/* CONTENT GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/10">
                    {/* LEFT: INFO */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            {/* Try AnimatedMedia first for Logo, then LogoFrame fallback */}
                            {(config.footerLogoUrl || config.logoUrl) ? (
                                <div style={{ width: 40, height: 40 }}>
                                    <AnimatedMedia
                                        imageUrl={config.footerLogoUrl || config.logoUrl}
                                        size={40}
                                        animationType="electric"
                                    />
                                </div>
                            ) : (
                                <AnimatedLogoFrame
                                    initiales={config.initialesLogo || (config.nomSite || 'F').slice(0, 2)}
                                    size="md"
                                    variant="Square"
                                />
                            )}
                            <span className="text-xl font-bold text-white">{config.nomSite || 'Factory'}</span>
                        </div>
                        <p className="text-slate-400 mb-6">{config.slogan}</p>

                        <div className="flex gap-3">
                            {socialLinks.map((social) => (
                                <a key={social.label} href={social.url!} className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-cyan-500 hover:text-white transition-colors">
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* CENTER: CONTACT */}
                    <div>
                        {(config.email || config.adresse) && (
                            <>
                                <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h4>
                                <ul className="space-y-3">
                                    {config.email && (
                                        <li><a href={`mailto:${config.email}`} className="flex items-center gap-3 text-slate-400 hover:text-cyan-400"><Mail className="w-4 h-4" /> {config.email}</a></li>
                                    )}
                                    {config.adresse && <li className="text-slate-400">{config.adresse}</li>}
                                </ul>
                            </>
                        )}
                    </div>

                    {/* RIGHT: LINKS (Example) */}
                    <div>
                        {/* Could add dynamic links here */}
                    </div>
                </div>

                {/* BOTTOM */}
                <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>{config.copyrightTexte || `© ${currentYear} ${config.nomSite || 'Factory'}. All rights reserved.`}</p>
                    {config.footerPoweredByText && <p>{config.footerPoweredByText}</p>}
                </div>

            </div>
        </footer>
    );
}
