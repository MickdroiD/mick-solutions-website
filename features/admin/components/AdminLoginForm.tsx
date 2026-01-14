'use client';

// ============================================
// ADMIN LOGIN FORM - V5 TRANSPLANT
// ============================================
// Original from V4, adapted for Next.js 16 Server Actions
// Retains the "Fun" Pin Code interaction.

import { useState, useRef, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { loginWithPin } from '../server/actions';

export default function AdminLoginForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Local State for PIN interaction
    const [pin, setPin] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState<string | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Auto-focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    // Handle PIN input change
    const handleChange = (index: number, value: string) => {
        if (value && !/^\d*$/.test(value)) return;

        const newPin = [...pin];

        // Handle paste
        if (value.length > 1) {
            const digits = value.slice(0, 6).split('');
            digits.forEach((digit, i) => { if (i < 6) newPin[i] = digit; });
            setPin(newPin);

            const nextEmptyIndex = newPin.findIndex(d => d === '');
            inputRefs.current[nextEmptyIndex === -1 ? 5 : nextEmptyIndex]?.focus();
            return;
        }

        newPin[index] = value;
        setPin(newPin);
        setError(null); // Clear error on typing

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit if full
        // (Optional: can be removed if you prefer manual button click)
    };

    // Handle backspace
    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    // Submit Logic
    const handleSubmit = () => {
        const fullPin = pin.join('');
        if (fullPin.length < 6) {
            setError('Entrez les 6 chiffres');
            return;
        }

        startTransition(async () => {
            const formData = new FormData();
            formData.append('pin', fullPin);

            const result = await loginWithPin({ error: undefined }, formData);

            if (result.error) {
                setError(result.error);
                setPin(['', '', '', '', '', '']); // Reset on error
                inputRefs.current[0]?.focus();
            } else {
                // Redirect happens server side
            }
        });
    };

    return (
        <div style={{
            background: 'rgba(15, 23, 42, 0.6)', // slate-900/60
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            width: '100%',
            maxWidth: '28rem'
        }}>
            {/* Branding Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src="/branding-logo.png" alt="Logo" style={{ height: '64px', width: 'auto', marginBottom: '1rem' }} />

                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem', lineHeight: '1.2' }}>
                    Console Admin
                </h1>
                <div style={{
                    fontSize: '0.55rem',
                    fontWeight: 700,
                    background: 'linear-gradient(to right, #22d3ee, #a855f7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '0px',
                    whiteSpace: 'nowrap'
                }}>
                    POWERED BY MICK-SOLUTIONS
                </div>
            </div>

            {/* PIN Input Grid */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                {pin.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        disabled={isPending}
                        style={{
                            width: '3rem',
                            height: '3.5rem',
                            textAlign: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            background: 'rgba(2, 6, 23, 0.5)', // slate-950/50
                            border: error ? '1px solid rgba(239, 68, 68, 0.5)' : digit ? '1px solid rgba(34, 211, 238, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '0.75rem',
                            color: 'white',
                            outline: 'none',
                            transition: 'all 0.2s',
                            cursor: isPending ? 'not-allowed' : 'text',
                            opacity: isPending ? 0.5 : 1
                        }}
                        onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px rgba(34, 211, 238, 0.3)'}
                        onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                        placeholder="•"
                    />
                ))}
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{
                            marginBottom: '1.5rem',
                            padding: '0.5rem',
                            borderRadius: '0.25rem',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#f87171',
                            fontSize: '0.75rem',
                            textAlign: 'center'
                        }}
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending || pin.some(d => !d)}
                style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    fontWeight: 600,
                    fontSize: '1.125rem',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    border: 'none',
                    cursor: isPending || pin.some(d => !d) ? 'not-allowed' : 'pointer',
                    background: isPending || pin.some(d => !d)
                        ? '#1e293b' // slate-800
                        : 'linear-gradient(to right, #0891b2, #2563eb)', // cyan-600 to blue-600
                    color: isPending || pin.some(d => !d) ? '#475569' : 'white', // slate-600
                    boxShadow: isPending || pin.some(d => !d) ? 'none' : '0 10px 15px -3px rgba(8, 145, 178, 0.2)'
                }}
            >
                {isPending ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                        ⏳ Vérification...
                    </span>
                ) : (
                    <>
                        Connexion
                    </>
                )}
            </button>
        </div>
    );
}
