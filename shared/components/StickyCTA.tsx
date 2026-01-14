// ============================================
// STICKY CTA - Factory V5
// Call-to-action flottant configurable
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

interface StickyCTAAction {
    icon: 'message' | 'phone' | 'mail' | 'custom';
    label: string;
    href: string;
    color?: string;
}

interface StickyCTAProps {
    actions?: StickyCTAAction[];
    primaryColor?: string;
    showAfter?: number; // ms après chargement
    position?: 'left' | 'right';
}

const ICONS = {
    message: MessageCircle,
    phone: Phone,
    mail: Mail,
    custom: MessageCircle,
};

export default function StickyCTA({
    actions = [
        { icon: 'message', label: 'Chat', href: '#contact', color: '#22d3ee' },
        { icon: 'phone', label: 'Appeler', href: 'tel:+41000000000', color: '#22c55e' },
        { icon: 'mail', label: 'Email', href: 'mailto:contact@example.ch', color: '#a855f7' },
    ],
    primaryColor = '#22d3ee',
    showAfter = 2000,
    position = 'right',
}: StickyCTAProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), showAfter);
        return () => clearTimeout(timer);
    }, [showAfter]);

    const positionStyle = position === 'left'
        ? { left: '1.5rem', right: 'auto' }
        : { right: '1.5rem', left: 'auto' };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    style={{
                        position: 'fixed',
                        bottom: '6rem',
                        ...positionStyle,
                        zIndex: 50,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: position === 'left' ? 'flex-start' : 'flex-end',
                        gap: '0.75rem',
                    }}
                >
                    {/* Action buttons */}
                    <AnimatePresence>
                        {isOpen && actions.map((action, idx) => {
                            const Icon = ICONS[action.icon];
                            return (
                                <motion.div
                                    key={action.label}
                                    initial={{ opacity: 0, y: 20, scale: 0.5 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 20, scale: 0.5 }}
                                    transition={{ delay: idx * 0.05 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    {position === 'right' && (
                                        <motion.span
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + idx * 0.05 }}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: 'rgba(0,0,0,0.8)',
                                                borderRadius: '0.5rem',
                                                color: '#fff',
                                                fontSize: '0.875rem',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {action.label}
                                        </motion.span>
                                    )}
                                    <Link
                                        href={action.href}
                                        style={{
                                            width: '3rem',
                                            height: '3rem',
                                            borderRadius: '50%',
                                            background: action.color || primaryColor,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            boxShadow: `0 4px 20px ${action.color || primaryColor}40`,
                                        }}
                                    >
                                        <Icon size={20} />
                                    </Link>
                                    {position === 'left' && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + idx * 0.05 }}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: 'rgba(0,0,0,0.8)',
                                                borderRadius: '0.5rem',
                                                color: '#fff',
                                                fontSize: '0.875rem',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {action.label}
                                        </motion.span>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Main toggle button */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(!isOpen)}
                        style={{
                            width: '3.5rem',
                            height: '3.5rem',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${primaryColor}, #a855f7)`,
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            boxShadow: '0 4px 25px rgba(34,211,238,0.4)',
                        }}
                    >
                        <motion.div
                            animate={{ rotate: isOpen ? 45 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
                        </motion.div>
                    </motion.button>

                    {/* Pulse animation when closed */}
                    {!isOpen && (
                        <motion.div
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 0, 0.5],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                [position]: 0,
                                width: '3.5rem',
                                height: '3.5rem',
                                borderRadius: '50%',
                                background: primaryColor,
                                pointerEvents: 'none',
                            }}
                        />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
