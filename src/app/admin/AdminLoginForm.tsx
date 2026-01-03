'use client';

// ============================================
// ADMIN LOGIN FORM - Client Component
// ============================================
// PIN entry form that calls /api/admin/auth

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLoginForm() {
  const router = useRouter();
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle PIN input change
  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d*$/.test(value)) return;

    const newPin = [...pin];
    
    // Handle paste
    if (value.length > 1) {
      const digits = value.slice(0, 6).split('');
      digits.forEach((digit, i) => {
        if (i < 6) newPin[i] = digit;
      });
      setPin(newPin);
      
      // Focus the next empty input or last input
      const nextEmptyIndex = newPin.findIndex(d => d === '');
      inputRefs.current[nextEmptyIndex === -1 ? 5 : nextEmptyIndex]?.focus();
      return;
    }

    newPin[index] = value;
    setPin(newPin);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
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

  // Submit PIN
  const handleSubmit = async () => {
    const fullPin = pin.join('');
    
    if (fullPin.length < 6) {
      setError('Veuillez entrer les 6 chiffres');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: fullPin }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.isAuthenticated) {
        // Success - redirect to V2
        router.push('/admin/v2');
        router.refresh();
      } else {
        // Error
        setError(data.error || 'Code PIN incorrect');
        setPin(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError('Erreur de connexion au serveur');
      setPin(['', '', '', '', '', '']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl">
      {/* PIN Input Grid */}
      <div className="flex justify-center gap-2 mb-6">
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
            disabled={isLoading}
            className={`
              w-12 h-14 text-center text-2xl font-bold
              bg-slate-900/50 border-2 rounded-xl
              text-white placeholder-slate-600
              focus:outline-none focus:ring-2 focus:ring-cyan-500/50
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-500/50' : digit ? 'border-cyan-500/50' : 'border-white/10'}
            `}
            placeholder="•"
          />
        ))}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || pin.some(d => !d)}
        className={`
          w-full py-4 rounded-xl font-semibold text-lg
          transition-all duration-300
          flex items-center justify-center gap-3
          ${isLoading || pin.some(d => !d)
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25'
          }
        `}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Vérification...
          </>
        ) : (
          <>
            <span>🔓</span>
            Connexion
          </>
        )}
      </button>

      {/* Hint */}
      <p className="mt-4 text-center text-slate-500 text-xs">
        Code à 6 chiffres fourni par l&apos;administrateur
      </p>
    </div>
  );
}

