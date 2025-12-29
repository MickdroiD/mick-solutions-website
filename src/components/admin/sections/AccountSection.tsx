'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  User, Lock, Key, Shield, Eye, EyeOff, RefreshCw,
  CheckCircle, AlertCircle, Save
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface AccountSectionProps {
  currentUser: { id: number; name: string; role: string; siteId?: string | null } | null;
  onLogout: () => void;
}

interface UserProfile {
  id: number;
  name: string;
  role: string;
  siteId?: string;
  isActive: boolean;
}

// ============================================
// COMPOSANT
// ============================================

export default function AccountSection({
  currentUser,
  onLogout,
}: AccountSectionProps) {
  // États pour les données utilisateur
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // États pour le formulaire de profil
  const [newName, setNewName] = useState('');

  // États pour le changement de mot de passe (PIN)
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [pinChanging, setPinChanging] = useState(false);

  // Notification helper
  const showNotificationMsg = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchProfile = useCallback(async () => {
    if (!currentUser?.id) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/account?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setNewName(data.user.name || '');
      } else {
        showNotificationMsg('error', 'Impossible de charger le profil');
      }
    } catch (error) {
      console.error('[AccountSection] Fetch error:', error);
      showNotificationMsg('error', 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, showNotificationMsg]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleUpdateProfile = async () => {
    if (!currentUser?.id) return;
    if (!newName.trim()) {
      showNotificationMsg('error', 'Le nom ne peut pas être vide');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          name: newName.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        showNotificationMsg('success', '✅ Profil mis à jour avec succès !');
      } else {
        const errData = await res.json();
        showNotificationMsg('error', errData.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('[AccountSection] Update error:', error);
      showNotificationMsg('error', 'Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePin = async () => {
    if (!currentUser?.id) return;

    // Validations
    if (!currentPin || currentPin.length !== 6) {
      showNotificationMsg('error', 'Le PIN actuel doit contenir 6 chiffres');
      return;
    }
    if (!newPin || newPin.length !== 6) {
      showNotificationMsg('error', 'Le nouveau PIN doit contenir 6 chiffres');
      return;
    }
    if (!/^\d{6}$/.test(newPin)) {
      showNotificationMsg('error', 'Le PIN doit contenir uniquement des chiffres');
      return;
    }
    if (newPin !== confirmPin) {
      showNotificationMsg('error', 'Les PINs ne correspondent pas');
      return;
    }
    if (newPin === currentPin) {
      showNotificationMsg('error', 'Le nouveau PIN doit être différent du PIN actuel');
      return;
    }

    setPinChanging(true);
    try {
      const res = await fetch('/api/admin/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          currentPin,
          newPin,
        }),
      });

      if (res.ok) {
        showNotificationMsg('success', '✅ PIN modifié avec succès !');
        // Reset form
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        setShowPasswordSection(false);
      } else {
        const errData = await res.json();
        showNotificationMsg('error', errData.error || 'Erreur lors du changement de PIN');
      }
    } catch (error) {
      console.error('[AccountSection] PIN change error:', error);
      showNotificationMsg('error', 'Erreur de connexion');
    } finally {
      setPinChanging(false);
    }
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  const renderPinInput = (value: string, onChange: (v: string) => void, placeholder: string) => (
    <div className="relative">
      <input
        type={showPins ? 'text' : 'password'}
        value={value}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '').slice(0, 6);
          onChange(val);
        }}
        placeholder={placeholder}
        maxLength={6}
        className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-all font-mono tracking-widest"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {value.length > 0 && (
          <span className={`text-xs ${value.length === 6 ? 'text-emerald-400' : 'text-slate-500'}`}>
            {value.length}/6
          </span>
        )}
      </div>
    </div>
  );

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl"
    >
      {/* Notification */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 p-4 rounded-xl ${
            notification.type === 'success' 
              ? 'bg-emerald-500/20 border border-emerald-500/30' 
              : 'bg-red-500/20 border border-red-500/30'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          <span className={notification.type === 'success' ? 'text-emerald-300' : 'text-red-300'}>
            {notification.message}
          </span>
        </motion.div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">👤 Mon Compte</h2>
            <p className="text-slate-400">Gérez votre profil et sécurité</p>
          </div>
        </div>
      </div>

      {/* Profil Section */}
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <User className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">Informations du profil</h3>
            <p className="text-slate-500 text-sm">Modifiez vos informations personnelles</p>
          </div>
        </div>

        {/* Avatar + Info Card */}
        <div className="flex items-center gap-6 p-4 bg-white/5 rounded-xl">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold">
            {(profile?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-lg">{profile?.name || 'Admin'}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                profile?.role === 'admin' 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {profile?.role === 'admin' ? '👑 Admin' : '👤 Client'}
              </span>
              {profile?.isActive && (
                <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs">
                  ✓ Actif
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Formulaire Nom */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-white font-medium text-sm">Nom d&apos;affichage</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Votre nom"
              className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>

          {/* ID Utilisateur (lecture seule) */}
          <div className="space-y-2">
            <label className="text-slate-400 font-medium text-sm">ID Utilisateur</label>
            <div className="px-4 py-3 bg-slate-900/50 border border-white/5 rounded-xl text-slate-500 font-mono">
              #{profile?.id || currentUser?.id || '-'}
            </div>
          </div>

          {/* Site ID (si client) */}
          {profile?.siteId && (
            <div className="space-y-2">
              <label className="text-slate-400 font-medium text-sm">Site associé</label>
              <div className="px-4 py-3 bg-slate-900/50 border border-white/5 rounded-xl text-slate-400 font-mono">
                {profile.siteId}
              </div>
            </div>
          )}

          <button
            type="button" onClick={handleUpdateProfile}
            disabled={saving || newName === profile?.name}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:from-cyan-400 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Enregistrer les modifications
          </button>
        </div>
      </div>

      {/* Sécurité Section */}
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-white font-bold">Sécurité</h3>
              <p className="text-slate-500 text-sm">Modifiez votre PIN de connexion</p>
            </div>
          </div>
          <button
            type="button" onClick={() => setShowPasswordSection(!showPasswordSection)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              showPasswordSection
                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <Key className="w-4 h-4" />
            {showPasswordSection ? 'Annuler' : 'Changer le PIN'}
          </button>
        </div>

        {showPasswordSection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-4 border-t border-white/10"
          >
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Lock className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <p className="text-amber-300 text-sm">
                Le PIN doit contenir exactement 6 chiffres.
              </p>
            </div>

            {/* Toggle Afficher les PINs */}
            <div className="flex items-center justify-end">
              <button
                type="button" onClick={() => setShowPins(!showPins)}
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-all"
              >
                {showPins ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPins ? 'Masquer' : 'Afficher'} les PINs
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-white font-medium text-sm">PIN actuel</label>
                {renderPinInput(currentPin, setCurrentPin, '• • • • • •')}
              </div>

              <div className="space-y-2">
                <label className="text-white font-medium text-sm">Nouveau PIN</label>
                {renderPinInput(newPin, setNewPin, '• • • • • •')}
              </div>

              <div className="space-y-2">
                <label className="text-white font-medium text-sm">Confirmer le nouveau PIN</label>
                {renderPinInput(confirmPin, setConfirmPin, '• • • • • •')}
                {confirmPin && newPin && confirmPin !== newPin && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Les PINs ne correspondent pas
                  </p>
                )}
              </div>

              <button
                type="button" onClick={handleChangePin}
                disabled={pinChanging || !currentPin || !newPin || !confirmPin || newPin !== confirmPin}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium hover:from-violet-400 hover:to-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pinChanging ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Key className="w-5 h-5" />
                )}
                Modifier le PIN
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Actions Section */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold">Zone de danger</h3>
            <p className="text-slate-400 text-sm">Se déconnecter de l&apos;administration</p>
          </div>
          <button
            type="button" onClick={onLogout}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
          >
            <Lock className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </div>
    </motion.div>
  );
}

