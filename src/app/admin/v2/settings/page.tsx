'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, Key, Save, Check, AlertCircle, Eye, EyeOff,
  Shield, RefreshCw, Info
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface NotificationState {
  type: 'success' | 'error' | 'info';
  message: string;
}

// ============================================
// MAIN PAGE
// ============================================

export default function SettingsPage() {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // Show notification helper
  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // Validate PIN format
  const isValidPin = (pin: string) => /^\d{6}$/.test(pin);

  // Handle PIN change
  const handleChangePin = async () => {
    // Validations
    if (!currentPin) {
      showNotification('error', 'Veuillez entrer votre PIN actuel');
      return;
    }

    if (!newPin) {
      showNotification('error', 'Veuillez entrer un nouveau PIN');
      return;
    }

    if (!isValidPin(newPin)) {
      showNotification('error', 'Le nouveau PIN doit contenir exactement 6 chiffres');
      return;
    }

    if (newPin !== confirmPin) {
      showNotification('error', 'Les PINs ne correspondent pas');
      return;
    }

    if (currentPin === newPin) {
      showNotification('error', 'Le nouveau PIN doit être différent du PIN actuel');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPin, newPin }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du changement de PIN');
      }

      showNotification('success', 'PIN modifié avec succès!');
      
      // Reset form
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate random PIN
  const generateRandomPin = () => {
    const pin = String(Math.floor(100000 + Math.random() * 900000));
    setNewPin(pin);
    setConfirmPin(pin);
    showNotification('info', `PIN généré: ${pin} - N'oubliez pas de le noter!`);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-[9999] px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-md ${
              notification.type === 'success' 
                ? 'bg-emerald-500' 
                : notification.type === 'error' 
                ? 'bg-red-500' 
                : 'bg-blue-500'
            }`}
          >
            {notification.type === 'success' ? (
              <Check className="w-5 h-5 text-white shrink-0" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-white shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-white shrink-0" />
            )}
            <span className="text-white font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-800/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/v2"
                className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="bg-black rounded-xl p-1.5">
                  <Image src="/admin-logo.svg" width={40} height={40} alt="Logo" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-xl flex items-center gap-2">
                    <Shield className="w-5 h-5 text-violet-400" />
                    Paramètres de sécurité
                  </h1>
                  <p className="text-slate-400 text-sm">Gestion du PIN admin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Change PIN Card */}
        <div className="bg-slate-800/50 rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Changer le PIN Admin</h2>
                <p className="text-slate-400 text-sm">
                  Modifiez votre code PIN à 6 chiffres pour accéder à l&apos;interface d&apos;administration
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Current PIN */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                PIN actuel
              </label>
              <div className="relative">
                <input
                  type={showCurrentPin ? 'text' : 'password'}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 font-mono text-lg tracking-widest"
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPin(!showCurrentPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showCurrentPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New PIN */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nouveau PIN
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 font-mono text-lg tracking-widest ${
                      newPin && !isValidPin(newPin)
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : newPin && isValidPin(newPin)
                        ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500'
                        : 'border-white/10 focus:border-violet-500 focus:ring-violet-500'
                    }`}
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showNewPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={generateRandomPin}
                  className="px-4 py-3 bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors flex items-center gap-2"
                  title="Générer un PIN aléatoire"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              {newPin && !isValidPin(newPin) && (
                <p className="text-red-400 text-sm mt-1">
                  Le PIN doit contenir exactement 6 chiffres
                </p>
              )}
            </div>

            {/* Confirm PIN */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirmer le nouveau PIN
              </label>
              <input
                type={showNewPin ? 'text' : 'password'}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 font-mono text-lg tracking-widest ${
                  confirmPin && confirmPin !== newPin
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : confirmPin && confirmPin === newPin && isValidPin(newPin)
                    ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500'
                    : 'border-white/10 focus:border-violet-500 focus:ring-violet-500'
                }`}
                maxLength={6}
              />
              {confirmPin && confirmPin !== newPin && (
                <p className="text-red-400 text-sm mt-1">
                  Les PINs ne correspondent pas
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleChangePin}
                disabled={isLoading || !currentPin || !isValidPin(newPin) || newPin !== confirmPin}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl transition-all hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Modification en cours...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Enregistrer le nouveau PIN
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
          <div className="flex gap-4">
            <Info className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-blue-400 font-semibold mb-2">Important</h3>
              <ul className="text-blue-300/80 text-sm space-y-2">
                <li>• Le nouveau PIN sera stocké dans la base de données Baserow</li>
                <li>• Pour une application immédiate, redémarrez le conteneur Docker</li>
                <li>• Notez votre PIN dans un endroit sûr - il ne peut pas être récupéré</li>
                <li>• Le PIN doit contenir exactement 6 chiffres</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/admin/v2"
            className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </Link>
        </div>
      </main>
    </div>
  );
}

