// ============================================
// WHATSAPP BUTTON BLOCK - Factory V5
// Floating or inline WhatsApp chat button
// ============================================

'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonStyle {
    variant?: 'floating' | 'inline' | 'icon-only';
    position?: 'bottom-right' | 'bottom-left';
    size?: 'sm' | 'md' | 'lg';
}

interface WhatsAppButtonBlockProps {
    content: {
        phoneNumber: string;
        message?: string;
        buttonText?: string;
    };
    style?: WhatsAppButtonStyle;
}

export default function WhatsAppButtonBlock({ content, style = {} }: WhatsAppButtonBlockProps) {
    const {
        variant = 'floating',
        position = 'bottom-right',
        size = 'md',
    } = style;

    const {
        phoneNumber,
        message = 'Bonjour, je souhaite en savoir plus !',
        buttonText = 'Discuter sur WhatsApp',
    } = content;

    // Clean phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    const getSizeStyles = () => {
        switch (size) {
            case 'sm': return { padding: '0.75rem', iconSize: 24, fontSize: '0.875rem' };
            case 'md': return { padding: '1rem', iconSize: 28, fontSize: '1rem' };
            case 'lg': return { padding: '1.25rem', iconSize: 32, fontSize: '1.125rem' };
            default: return { padding: '1rem', iconSize: 28, fontSize: '1rem' };
        }
    };

    const sizeStyles = getSizeStyles();

    if (variant === 'floating') {
        return (
            <motion.a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    position: 'fixed',
                    [position === 'bottom-right' ? 'right' : 'left']: '1.5rem',
                    bottom: '1.5rem',
                    width: size === 'sm' ? '48px' : size === 'lg' ? '72px' : '60px',
                    height: size === 'sm' ? '48px' : size === 'lg' ? '72px' : '60px',
                    borderRadius: '50%',
                    background: '#25D366',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)',
                    zIndex: 9999,
                    textDecoration: 'none',
                }}
            >
                <MessageCircle size={sizeStyles.iconSize} style={{ color: '#fff' }} />
            </motion.a>
        );
    }

    if (variant === 'icon-only') {
        return (
            <motion.a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: sizeStyles.padding,
                    borderRadius: '50%',
                    background: '#25D366',
                    textDecoration: 'none',
                    boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)',
                }}
            >
                <MessageCircle size={sizeStyles.iconSize} style={{ color: '#fff' }} />
            </motion.a>
        );
    }

    // Default: inline variant
    return (
        <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: `${sizeStyles.padding} 1.5rem`,
                borderRadius: '0.75rem',
                background: '#25D366',
                color: '#fff',
                fontWeight: 600,
                fontSize: sizeStyles.fontSize,
                textDecoration: 'none',
                boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)',
                transition: 'all 0.2s',
            }}
        >
            <MessageCircle size={sizeStyles.iconSize - 4} />
            {buttonText}
        </motion.a>
    );
}
