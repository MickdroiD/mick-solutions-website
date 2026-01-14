// ============================================
// TEAM BLOCK - Factory V5
// Team member grid with V4 Fusion (Carousel, Effects)
// ============================================

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, Twitter, Mail, Globe, Instagram, ArrowLeft, ArrowRight } from 'lucide-react';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    imageUrl?: string;
    bio?: string;
    socials?: {
        linkedin?: string;
        twitter?: string;
        instagram?: string;
        email?: string;
        website?: string;
    };
    // Legacy support
    linkedin?: string;
    twitter?: string;
    email?: string;
}

interface TeamStyle {
    variant?: 'grid' | 'cards' | 'list' | 'carousel';
    columns?: 2 | 3 | 4 | 5;
    showSocial?: boolean;
    imageShape?: 'circle' | 'rounded' | 'square';
    hoverEffect?: 'zoom' | 'grayscale' | 'lift' | 'none';
    textAlign?: 'center' | 'left';
}

interface TeamBlockProps {
    content: {
        title?: string;
        members: TeamMember[];
    };
    style?: TeamStyle;
}

export default function TeamBlock({ content, style = {} }: TeamBlockProps) {
    const {
        variant = 'grid',
        columns = 3,
        showSocial = true,
        imageShape = 'circle',
        hoverEffect = 'zoom',
        textAlign = 'center',
    } = style;

    const { title, members = [] } = content;
    const [pageIndex, setPageIndex] = useState(0);

    const getImageRadius = () => {
        switch (imageShape) {
            case 'circle': return '50%';
            case 'rounded': return '1rem';
            case 'square': return '0';
            default: return '50%';
        }
    };

    const getEffectStyles = () => {
        switch (hoverEffect) {
            case 'lift':
                return { y: -10 };
            case 'zoom':
                return { scale: 1.05 };
            case 'grayscale':
                return { filter: 'grayscale(0%)' };
            default:
                return {};
        }
    };

    // Pagination Logic for Carousel
    const itemsPerPage = columns; // Reuse column count as items per page for carousel
    const totalPages = Math.ceil(members.length / itemsPerPage);
    const visibleMembers = variant === 'carousel'
        ? members.slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage)
        : members;

    const nextSlide = () => setPageIndex((prev) => (prev + 1) % totalPages);
    const prevSlide = () => setPageIndex((prev) => (prev - 1 + totalPages) % totalPages);

    return (
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            {title && (
                <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem', textAlign: 'center' }}>
                    {title}
                </h3>
            )}

            <div style={{ position: 'relative' }}>
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={pageIndex}
                        initial={variant === 'carousel' ? { opacity: 0, x: 20 } : {}}
                        animate={{ opacity: 1, x: 0 }}
                        exit={variant === 'carousel' ? { opacity: 0, x: -20 } : {}}
                        transition={{ duration: 0.3 }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${variant === 'carousel' ? itemsPerPage : columns}, 1fr)`,
                            gap: variant === 'cards' || variant === 'carousel' ? '1.5rem' : '2rem',
                        }}
                    >
                        {visibleMembers.map((member, idx) => (
                            <motion.div
                                key={member.id}
                                whileHover={getEffectStyles()}
                                style={{
                                    textAlign: textAlign,
                                    padding: variant === 'cards' || variant === 'carousel' ? '2rem' : '1rem',
                                    background: variant === 'cards' || variant === 'carousel' ? 'rgba(255,255,255,0.03)' : 'transparent',
                                    borderRadius: variant === 'cards' || variant === 'carousel' ? '1rem' : '0',
                                    border: variant === 'cards' || variant === 'carousel' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                    cursor: hoverEffect !== 'none' ? 'pointer' : 'default',
                                    transition: 'background 0.3s',
                                }}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    margin: textAlign === 'center' ? '0 auto 1rem' : '0 0 1rem 0',
                                    borderRadius: getImageRadius(),
                                    overflow: 'hidden',
                                    background: member.imageUrl ? 'transparent' : 'linear-gradient(135deg, #22d3ee, #a855f7)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    filter: hoverEffect === 'grayscale' ? 'grayscale(100%)' : 'none',
                                    transition: 'filter 0.3s',
                                }}>
                                    {member.imageUrl ? (
                                        <img
                                            src={member.imageUrl}
                                            alt={member.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <span style={{ color: '#fff', fontSize: '2rem', fontWeight: 700 }}>
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    )}
                                </div>

                                {/* Info */}
                                <h4 style={{ color: '#fff', fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                    {member.name}
                                </h4>
                                <div style={{ color: '#22d3ee', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                                    {member.role}
                                </div>
                                {member.bio && (
                                    <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                        {member.bio}
                                    </p>
                                )}

                                {/* Social Links - Merging Legacy and New V4 structure */}
                                {showSocial && (
                                    <div style={{ display: 'flex', justifyContent: textAlign === 'center' ? 'center' : 'flex-start', gap: '0.75rem' }}>
                                        {(member.socials?.linkedin || member.linkedin) && (
                                            <a href={member.socials?.linkedin || member.linkedin} target="_blank" rel="noopener" style={{ color: '#9ca3af', transition: 'color 0.2s' }}>
                                                <Linkedin size={20} />
                                            </a>
                                        )}
                                        {(member.socials?.twitter || member.twitter) && (
                                            <a href={member.socials?.twitter || member.twitter} target="_blank" rel="noopener" style={{ color: '#9ca3af' }}>
                                                <Twitter size={20} />
                                            </a>
                                        )}
                                        {member.socials?.instagram && (
                                            <a href={member.socials?.instagram} target="_blank" rel="noopener" style={{ color: '#9ca3af' }}>
                                                <Instagram size={20} />
                                            </a>
                                        )}
                                        {(member.socials?.email || member.email) && (
                                            <a href={`mailto:${member.socials?.email || member.email}`} style={{ color: '#9ca3af' }}>
                                                <Mail size={20} />
                                            </a>
                                        )}
                                        {member.socials?.website && (
                                            <a href={member.socials?.website} target="_blank" rel="noopener" style={{ color: '#9ca3af' }}>
                                                <Globe size={20} />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* Carousel Navigation */}
                {variant === 'carousel' && totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                        <button onClick={prevSlide} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowLeft size={20} />
                        </button>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <div
                                    key={i}
                                    onClick={() => setPageIndex(i)}
                                    style={{
                                        width: i === pageIndex ? '24px' : '8px',
                                        height: '8px',
                                        borderRadius: '4px',
                                        background: i === pageIndex ? '#22d3ee' : 'rgba(255,255,255,0.2)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                />
                            ))}
                        </div>
                        <button onClick={nextSlide} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
