'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Save, RotateCcw, Check, Sparkles, 
  Menu, X, RefreshCw, AlertCircle,
  ExternalLink, Bot, Eye, PanelRightClose, PanelRight,
  Image as ImageIcon, Trash2
} from 'lucide-react';
import Portal from '@/components/Portal';
import AdminSidebar, { NAV_SECTIONS } from '@/components/admin/AdminSidebar';
import { SitePreviewBlock } from '@/components/admin/ui';
import {
  DashboardSection,
  BrandSection,
  HeroSection,
  FeaturesSection,
  MediaSection,
  SocialProofSection,
  ContactSection,
  SystemSection,
  HeaderSection,
  FooterSection,
  AccountSection,
} from '@/components/admin/sections';
import { ArchitectureDetector } from '@/components/admin/v2';

// ============================================
// TYPES
// ============================================

interface AdminConfig {
  [key: string]: string | boolean | number | undefined | unknown[];
}

interface ConfigOptions {
  [key: string]: string[];
}

interface AuthUser {
  isAuthenticated: true;
  id: number;
  name: string;
  role: 'admin' | 'client';
  siteId: string | null;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

function AdminPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [pinError, setPinError] = useState(false);
  const [pinErrorMessage, setPinErrorMessage] = useState('');
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [options, setOptions] = useState<ConfigOptions>({});
  const [originalConfig, setOriginalConfig] = useState<AdminConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [autoAuthAttempted, setAutoAuthAttempted] = useState(false);
  
  // États pour le modal AI
  const [aiPromptModal, setAiPromptModal] = useState<{ sectionKey: string; variantKey: string; showKey: string } | null>(null);
  const [aiPromptText, setAiPromptText] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiGeneratedImageUrl, setAiGeneratedImageUrl] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  // États pour le Split View (V2)
  const [lastSaveTimestamp, setLastSaveTimestamp] = useState<number>(0);
  const [showPreview, setShowPreview] = useState(true); // Mode Focus toggle

  // Notification helper
  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/config');
      if (!res.ok) throw new Error('Erreur serveur');
      const data = await res.json();
      setConfig(data.config);
      setOriginalConfig(data.config);
      setOptions(data.options || {});
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('error', 'Impossible de charger la configuration');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConfig();
    }
  }, [isAuthenticated, fetchConfig]);

  // ============================================
  // AUTHENTICATION
  // ============================================

  useEffect(() => {
    const pinFromUrl = searchParams.get('pin');
    if (pinFromUrl && pinFromUrl.length === 6 && !autoAuthAttempted) {
      setAutoAuthAttempted(true);
      handleAutoAuth(pinFromUrl);
    }
  }, [searchParams, autoAuthAttempted]);

  const handleAutoAuth = async (pinCode: string) => {
    setAuthLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinCode }),
      });
      const data = await res.json();
      if (data.isAuthenticated && data.user) {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        
        // Redirect to original page if specified
        const redirectTo = searchParams.get('redirect');
        if (redirectTo && redirectTo.startsWith('/admin')) {
          router.push(redirectTo);
        }
      }
    } catch (error) {
      console.error('Auto auth error:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setPinError(false);

    if (value && index < 5) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }

    if (index === 5 && value) {
      const fullPin = newPin.join('');
      if (fullPin.length === 6) {
        handlePinSubmit(fullPin);
      }
    }
  };

  const handlePinSubmit = async (fullPin: string) => {
    // Réinitialiser l'état d'erreur avant chaque tentative
    setPinError(false);
    setPinErrorMessage('');
    setAuthLoading(true);
    
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: fullPin }),
      });
      
      // Parser la réponse (même si erreur HTTP)
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Réponse invalide du serveur');
      }
      
      if (data.isAuthenticated && data.user) {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        // Clear du PIN pour sécurité
        setPin(['', '', '', '', '', '']);
        
        // Redirect to original page if specified
        const redirectTo = searchParams.get('redirect');
        if (redirectTo && redirectTo.startsWith('/admin')) {
          router.push(redirectTo);
          return;
        }
      } else {
        // Échec auth - afficher l'erreur
        setPinError(true);
        setPinErrorMessage(data.error || 'PIN incorrect');
        // Reset complet du formulaire
        setPin(['', '', '', '', '', '']);
        // Focus sur le premier champ après un court délai
        setTimeout(() => {
          document.getElementById('pin-0')?.focus();
        }, 100);
      }
    } catch (error) {
      console.error('[Auth] Erreur:', error);
      setPinError(true);
      setPinErrorMessage(error instanceof Error ? error.message : 'Erreur de connexion');
      setPin(['', '', '', '', '', '']);
      setTimeout(() => {
        document.getElementById('pin-0')?.focus();
      }, 100);
    } finally {
      // TOUJOURS réinitialiser le loading
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setPin(['', '', '', '', '', '']);
    setConfig(null);
    setOriginalConfig(null);
  };

  // ============================================
  // CONFIG MANAGEMENT
  // ============================================

  // ⚠️ CORRECTION BUG RE-RENDER: Ne PAS dépendre de `config` dans le useCallback
  // Utiliser la forme fonctionnelle de setState pour éviter les recréations
  const updateConfig = useCallback((key: string, value: unknown) => {
    setConfig(prev => {
      if (!prev) return prev;
      return { ...prev, [key]: value } as AdminConfig;
    });
  }, []); // ← PAS de dépendance sur config !
  
  const updateConfigMultiple = useCallback((updates: Record<string, unknown>) => {
    setConfig(prev => {
      if (!prev) return prev;
      return { ...prev, ...updates } as AdminConfig;
    });
  }, []); // ← PAS de dépendance sur config !

  const hasChanges = config && originalConfig && JSON.stringify(config) !== JSON.stringify(originalConfig);

  // ============================================
  // STABLE SAVE CONFIG (sans dépendance cyclique)
  // ============================================
  
  // Ref pour accéder à config dans saveConfig sans dépendance
  const configRef = useRef(config);
  const savingRef = useRef(saving);
  
  // Synchroniser les refs
  useEffect(() => {
    configRef.current = config;
  }, [config]);
  
  useEffect(() => {
    savingRef.current = saving;
  }, [saving]);

  const saveConfig = useCallback(async () => {
    const currentConfig = configRef.current;
    if (!currentConfig || savingRef.current) return;
    
    setSaving(true);
    try {
      // Nettoyer le config avant envoi (éviter undefined/circular)
      const cleanConfig = JSON.parse(JSON.stringify(currentConfig));
      
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: cleanConfig }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('[SaveConfig] API Error:', res.status, errorData);
        throw new Error(errorData.error || `Erreur HTTP ${res.status}`);
      }
      
      setOriginalConfig(currentConfig);
      setLastSaveTimestamp(Date.now()); // Déclencher le refresh de l'aperçu
      showNotification('success', '✅ Configuration sauvegardée avec succès !');
    } catch (error) {
      // ⚠️ NE PAS RECHARGER LA PAGE - afficher l'erreur uniquement
      console.error('[SaveConfig] Failed details:', error);
      const message = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde';
      showNotification('error', `❌ ${message}`);
    } finally {
      setSaving(false);
    }
  }, [showNotification]); // ← PAS de dépendance sur config !
  
  // ❌ AUTO-SAVE DÉSACTIVÉ - Sauvegarde manuelle uniquement
  // L'utilisateur doit cliquer sur "Sauvegarder" pour enregistrer ses modifications

  const resetConfig = () => {
    if (originalConfig) {
      setConfig(originalConfig);
      showNotification('success', 'Modifications annulées');
    }
  };

  // ============================================
  // IMAGE UPLOAD (avec Magic Upload pour logos)
  // ============================================

  const handleImageUpload = async (key: string, file: File, category: string) => {
    setUploading(key);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('fieldKey', key); // Pour Magic Upload

      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        // ✨ Magic Upload: Logo → génère auto Favicon + OG Image
        if (data.isMagicUpload) {
          // Construire l'objet de mise à jour avec tous les champs retournés
          const updates: Record<string, string> = {};
          if (data.logoUrl) updates.logoUrl = data.logoUrl;
          if (data.faviconUrl) updates.faviconUrl = data.faviconUrl;
          if (data.ogImageUrl) updates.ogImageUrl = data.ogImageUrl;
          
          // Appliquer toutes les mises à jour en une seule fois (optimisé)
          updateConfigMultiple(updates);
          
          // Toast spécifique selon ce qui a été généré
          const generatedCount = Object.keys(updates).length;
          if (generatedCount >= 3) {
            showNotification('success', '✨ Identité complète générée (Logo + Favicon + Social) !');
          } else if (generatedCount === 2) {
            showNotification('success', '✨ Logo et variantes générés !');
          } else {
            showNotification('success', '✨ Logo uploadé !');
          }
        } else if (data.url) {
          // Upload standard (non Magic Upload)
          updateConfig(key, data.url);
          showNotification('success', data.converted ? 'Image convertie et uploadée !' : 'Image uploadée !');
        }
      } else {
        showNotification('error', data.error || 'Erreur upload');
      }
    } catch {
      showNotification('error', 'Erreur lors de l\'upload');
    } finally {
      setUploading(null);
    }
  };

  // ============================================
  // AI MODAL HANDLER
  // ============================================

  const openAIModal = (context: { sectionKey: string; variantKey: string; showKey: string }) => {
    setAiPromptModal(context);
    const isImage = context.sectionKey === 'image' || context.variantKey === 'image';
    setAiPromptText(isImage 
      ? 'Professional website image, modern design, clean aesthetic, high quality'
      : `Génère du contenu pour la section ${context.sectionKey} d'un site web professionnel.`
    );
  };

  // ============================================
  // LOGIN SCREEN
  // ============================================

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="bg-black rounded-2xl p-2">
                <Image 
                  src="/admin-logo.svg" 
                  width={80} 
                  height={80} 
                  alt="Mick Solutions" 
                  className="mb-2" 
                />
              </div>
              <span className="text-2xl font-bold text-white">Espace Client</span>
            </div>
            <p className="text-slate-400">Panneau de configuration</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-white mb-2">Accès sécurisé</h2>
              <p className="text-slate-400">Entrez votre code PIN à 6 chiffres</p>
            </div>

            <div className="flex justify-center gap-3 mb-6">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  id={`pin-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !digit && index > 0) {
                      document.getElementById(`pin-${index - 1}`)?.focus();
                    }
                  }}
                  disabled={authLoading}
                  className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 bg-slate-900/50 text-white focus:outline-none transition-all ${
                    pinError ? 'border-red-500 shake' : 'border-white/20 focus:border-cyan-500'
                  }`}
                />
              ))}
            </div>

            {pinError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 justify-center text-red-400 mb-4"
              >
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{pinErrorMessage}</span>
              </motion.div>
            )}

            {authLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent" />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const fullPin = pin.join('');
                  if (fullPin.length === 6) handlePinSubmit(fullPin);
                }}
                disabled={pin.join('').length !== 6}
                className="w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90"
              >
                Se connecter
              </button>
            )}
            
            <p className="text-xs text-slate-500 font-medium mt-6 uppercase tracking-wider text-center">Powered by Mick-Solutions</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // LOADING
  // ============================================

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  const currentNavSection = NAV_SECTIONS.find(s => s.id === activeSection) || NAV_SECTIONS[0];

  // ============================================
  // RENDER SECTION CONTENT
  // ============================================

  // ⚠️ CORRECTION: Chaque section a une key stable pour éviter les re-montages par AnimatePresence
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <DashboardSection
            key="section-dashboard"
            config={config}
            onNavigate={setActiveSection}
            currentUser={currentUser}
          />
        );
      case 'brand':
        return (
          <BrandSection
            key="section-brand"
            config={config}
            options={options}
            onConfigUpdate={updateConfig}
            onImageUpload={handleImageUpload}
            uploading={uploading}
          />
        );
      case 'hero':
        return (
          <HeroSection
            key="section-hero"
            config={config}
            options={options}
            onConfigUpdate={updateConfig}
            onConfigUpdateMultiple={updateConfigMultiple}
            onImageUpload={handleImageUpload}
            onOpenAIModal={openAIModal}
            uploading={uploading}
          />
        );
      case 'features':
        return (
          <FeaturesSection
            key="section-features"
            config={config}
            options={options}
            onConfigUpdate={updateConfig}
            onConfigUpdateMultiple={updateConfigMultiple}
            onOpenAIModal={openAIModal}
          />
        );
      case 'media':
        return (
          <MediaSection
            key="section-media"
            config={config}
            options={options}
            onConfigUpdate={updateConfig}
            onConfigUpdateMultiple={updateConfigMultiple}
            onOpenAIModal={openAIModal}
          />
        );
      case 'social':
        return (
          <SocialProofSection
            key="section-social"
            config={config}
            options={options}
            onConfigUpdate={updateConfig}
            onConfigUpdateMultiple={updateConfigMultiple}
            onOpenAIModal={openAIModal}
          />
        );
      case 'contact':
        return (
          <ContactSection
            key="section-contact"
            config={config}
            options={options}
            onConfigUpdate={updateConfig}
            onConfigUpdateMultiple={updateConfigMultiple}
          />
        );
      case 'system':
        return (
          <SystemSection
            key="section-system"
            config={config}
            options={options}
            onConfigUpdate={updateConfig}
            onOpenAIModal={openAIModal}
          />
        );
      case 'header':
        return (
          <HeaderSection
            key="section-header"
            config={config}
            options={options}
            onConfigUpdate={updateConfig}
            onImageUpload={handleImageUpload}
            uploading={uploading}
          />
        );
      case 'footer':
        return (
          <FooterSection
            key="section-footer"
            config={config}
            options={options}
            onConfigUpdate={updateConfig}
            onImageUpload={handleImageUpload}
            uploading={uploading}
          />
        );
      case 'account':
        return (
          <AccountSection
            key="section-account"
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        );
      default:
        return null;
    }
  };

  // ============================================
  // SPLIT VIEW LOGIC
  // ============================================
  
  // Cacher l'aperçu sur la section Dashboard
  const shouldShowPreview = showPreview && activeSection !== 'dashboard';

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-slate-900">
      {/* ========== NOTIFICATION TOAST ========== */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-[9999] px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
              notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          >
            {notification.type === 'success' ? <Check className="w-5 h-5 text-white" /> : <AlertCircle className="w-5 h-5 text-white" />}
            <span className="text-white font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex flex-col lg:flex-row min-h-screen">
        {/* ========== SIDEBAR DESKTOP ========== */}
        <aside className="hidden lg:block shrink-0">
          <AdminSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onLogout={handleLogout}
          />
        </aside>

        {/* ========== ZONE PRINCIPALE (SPLIT VIEW) ========== */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-screen overflow-hidden">
          {/* ===== COLONNE GAUCHE : Formulaire (Scrollable) ===== */}
          <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
            shouldShowPreview ? 'lg:w-1/2 lg:max-w-[60%]' : 'lg:w-full'
          }`}>
            {/* Header avec contrôles */}
            <header className="sticky top-0 z-40 bg-slate-800/95 backdrop-blur-xl border-b border-white/5 px-4 py-3 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-white/10">
                    <Menu className="w-6 h-6 text-white" />
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{currentNavSection.emoji}</span>
                    <h1 className="text-white font-bold">{currentNavSection.title}</h1>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Toggle Mode Focus (Desktop uniquement, pas sur Dashboard) */}
                  {activeSection !== 'dashboard' && (
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                        showPreview 
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                          : 'bg-slate-700/50 text-slate-400 hover:text-white'
                      }`}
                      title={showPreview ? 'Masquer l\'aperçu (Mode Focus)' : 'Afficher l\'aperçu'}
                    >
                      {showPreview ? (
                        <>
                          <PanelRightClose className="w-4 h-4" />
                          <span className="text-xs font-medium">Aperçu</span>
                        </>
                      ) : (
                        <>
                          <PanelRight className="w-4 h-4" />
                          <span className="text-xs font-medium">Focus</span>
                        </>
                      )}
                    </button>
                  )}

                  {hasChanges && (
                    <>
                      <button type="button" onClick={resetConfig} className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:text-white transition-all" title="Annuler les modifications">
                        <RotateCcw className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={saveConfig}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/30"
                      >
                        {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        <span className="hidden sm:inline">💾 Sauvegarder</span>
                        <span className="sm:hidden">💾</span>
                      </button>
                    </>
                  )}
                  {!hasChanges && (
                    <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                      <Check className="w-4 h-4 inline mr-1" />
                      <span className="hidden sm:inline">À jour</span>
                    </span>
                  )}
                </div>
              </div>
            </header>

            {/* Contenu du formulaire (Scrollable) */}
            <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                {renderSectionContent()}
              </AnimatePresence>
            </div>

            {/* Bottom Nav Mobile */}
            <nav className="lg:hidden sticky bottom-0 bg-slate-800/95 backdrop-blur-xl border-t border-white/5 shrink-0">
              <div className="flex justify-around py-2">
                {NAV_SECTIONS.slice(0, 5).map((section) => (
                  <button
                    type="button"
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                      activeSection === section.id ? 'text-cyan-400' : 'text-slate-500'
                    }`}
                  >
                    <span className="text-xl">{section.emoji}</span>
                    <span className="text-[10px]">{section.title.slice(0, 6)}</span>
                  </button>
                ))}
                <button type="button" onClick={() => setSidebarOpen(true)} className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-500">
                  <span className="text-xl">⋯</span>
                  <span className="text-[10px]">Plus</span>
                </button>
              </div>
            </nav>
          </div>

          {/* ===== COLONNE DROITE : Aperçu (Fixe, Desktop only) ===== */}
          <AnimatePresence>
            {shouldShowPreview && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: '50%' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="hidden lg:flex flex-col border-l border-white/10 bg-slate-950/50"
                style={{ minWidth: '400px', maxWidth: '50%' }}
              >
                <SitePreviewBlock
                  lastUpdate={lastSaveTimestamp}
                  previewUrl="/"
                  height="100%"
                  className="h-full rounded-none border-0"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 z-50"
              >
                <AdminSidebar
                  activeSection={activeSection}
                  onSectionChange={setActiveSection}
                  onLogout={handleLogout}
                  isMobile
                  onClose={() => setSidebarOpen(false)}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </main>

      {/* ============================================ */}
      {/* MODAL AI - VIA PORTAL */}
      {/* ============================================ */}
      {aiPromptModal && (
        <Portal>
          <div 
            onClick={() => { setAiPromptModal(null); setAiResult(null); setAiGeneratedImageUrl(null); }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              zIndex: 99998,
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 99999,
              maxHeight: 'calc(100vh - 40px)',
              width: '95vw',
              maxWidth: aiResult || aiGeneratedImageUrl ? '700px' : '450px',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#0f172a',
              boxShadow: '0 0 50px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '16px',
              transition: 'max-width 0.3s ease',
            }}
          >
            {/* Header */}
            <div className="p-3 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Génération IA</h3>
                  <p className="text-xs text-slate-400">Section: {aiPromptModal.sectionKey}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => { setAiPromptModal(null); setAiResult(null); setAiGeneratedImageUrl(null); }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* API Banner */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-emerald-300 text-xs">Clé API incluse dans votre abonnement</p>
              </div>

              {/* Layout */}
              <div className={aiResult || aiGeneratedImageUrl ? 'grid grid-cols-2 gap-3' : ''}>
                {/* Config Column */}
                <div className="space-y-3">
                  {/* Provider + Model */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Fournisseur</label>
                      <select
                        value={String(config?.aiProvider || 'openai')}
                        onChange={(e) => updateConfig('aiProvider', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 [&>option]:bg-slate-800"
                      >
                        <option value="openai">🤖 OpenAI</option>
                        <option value="gemini">✨ Gemini</option>
                        <option value="replicate">🖼️ Replicate</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Modèle</label>
                      <select
                        value={String(config?.aiModel || 'gpt-4o-mini')}
                        onChange={(e) => updateConfig('aiModel', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 [&>option]:bg-slate-800"
                      >
                        <optgroup label="OpenAI">
                          <option value="gpt-4o-mini">GPT-4o Mini</option>
                          <option value="gpt-4o">GPT-4o</option>
                        </optgroup>
                        <optgroup label="Google Gemini">
                          <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                          <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                        </optgroup>
                        <optgroup label="Images">
                          <option value="flux-1.1-pro">FLUX 1.1 Pro</option>
                          <option value="flux-schnell">FLUX Schnell</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  {/* Tone */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Ton</label>
                    <div className="flex gap-1 flex-wrap">
                      {[
                        { key: 'Professional', label: '👔 Pro' },
                        { key: 'Friendly', label: '😊 Amical' },
                        { key: 'Casual', label: '👋 Cool' },
                        { key: 'Formal', label: '🎩 Formel' }
                      ].map((tone) => (
                        <button
                          type="button"
                          key={tone.key}
                          onClick={() => updateConfig('aiTone', tone.key)}
                          className={`px-2 py-1 rounded text-xs transition-all ${
                            config?.aiTone === tone.key
                              ? 'bg-cyan-500 text-white'
                              : 'bg-white/5 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          {tone.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Instructions</label>
                    <textarea
                      value={aiPromptText}
                      onChange={(e) => setAiPromptText(e.target.value)}
                      placeholder="Décrivez ce que vous voulez générer..."
                      rows={3}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>

                  {/* Generate Button */}
                  <button
                    type="button"
                    onClick={async () => {
                      setAiGenerating(true);
                      setAiResult(null);
                      setAiGeneratedImageUrl(null);
                      
                      const action = aiPromptModal.sectionKey || 'text';
                      const isImage = action === 'image';
                      const provider = isImage ? 'replicate' : (config?.aiProvider || 'openai');
                      const model = isImage ? 'flux-1.1-pro' : (config?.aiModel || 'gpt-4o-mini');

                      try {
                        const response = await fetch('/api/ai/generate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            action,
                            provider,
                            model,
                            prompt: aiPromptText || 'Génère du contenu professionnel.',
                            context: {
                              industry: config?.aiIndustry,
                              tone: config?.aiTone,
                              keywords: config?.aiKeywords,
                              language: 'fr',
                            },
                          }),
                        });

                        const data = await response.json();

                        if (data.success) {
                          if (data.imageUrl) {
                            setAiGeneratedImageUrl(data.imageUrl);
                          } else if (data.content) {
                            const formatted = typeof data.content === 'object' 
                              ? JSON.stringify(data.content, null, 2)
                              : String(data.content);
                            setAiResult(formatted);
                          }
                        } else {
                          setAiResult(`❌ Erreur: ${data.error || 'Erreur inconnue'}`);
                        }
                      } catch (error) {
                        console.error('[AI] Erreur:', error);
                        setAiResult('❌ Erreur de connexion');
                      } finally {
                        setAiGenerating(false);
                      }
                    }}
                    disabled={aiGenerating}
                    className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {aiGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Générer
                      </>
                    )}
                  </button>
                </div>

                {/* Result Column - Image */}
                {aiGeneratedImageUrl && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-400 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-emerald-400" />
                        Image générée
                      </label>
                    </div>
                    
                    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-slate-800/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={aiGeneratedImageUrl} 
                        alt="Image IA générée" 
                        className="w-full h-auto max-h-64 object-contain"
                      />
                      <div className="absolute top-2 right-2">
                        <a 
                          href={aiGeneratedImageUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (aiPromptModal?.sectionKey === 'hero') {
                            updateConfigMultiple({ heroBackgroundUrl: aiGeneratedImageUrl });
                            showNotification('success', '✅ Image appliquée au Hero !');
                          } else {
                            navigator.clipboard.writeText(aiGeneratedImageUrl);
                            showNotification('success', '📋 URL copiée');
                          }
                          setAiGeneratedImageUrl(null);
                          setAiPromptModal(null);
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Utiliser
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiGeneratedImageUrl(null)}
                        className="px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/30 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Result Column - Text */}
                {aiResult && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-400">Résultat</label>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(aiResult);
                          showNotification('success', '📋 Copié !');
                        }}
                        className="text-xs text-cyan-400 hover:text-cyan-300"
                      >
                        📋 Copier
                      </button>
                    </div>
                    <textarea
                      value={aiResult}
                      onChange={(e) => setAiResult(e.target.value)}
                      rows={12}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-800/50 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-500 resize-none"
                    />
                    
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          const action = aiPromptModal.sectionKey;
                          
                          // ✅ CORRECTION: Gérer JSON ET texte brut
                          try {
                            // Essayer de parser comme JSON
                            const content = JSON.parse(aiResult);
                            
                            if (action === 'hero' && content) {
                              updateConfigMultiple({
                                badgeHero: content.badge || content.Badge || '',
                                titreHero: content.title || content.titre || content.Titre || '',
                                sousTitreHero: content.subtitle || content.sousTitre || content.description || '',
                                ctaPrincipal: content.cta1 || content.ctaPrincipal || content.cta || '',
                                ctaSecondaire: content.cta2 || content.ctaSecondaire || '',
                                showHero: true,
                              });
                              showNotification('success', '✅ Hero appliqué ! N\'oubliez pas de Sauvegarder.');
                            } else {
                              // Copier dans le presse-papiers si pas une section connue
                              await navigator.clipboard.writeText(aiResult);
                              showNotification('success', '📋 Contenu JSON copié dans le presse-papiers');
                            }
                          } catch {
                            // Si pas JSON valide, copier le texte brut
                            try {
                              await navigator.clipboard.writeText(aiResult);
                              showNotification('success', '📋 Texte copié ! Collez-le dans le champ souhaité.');
                            } catch (clipboardError) {
                              console.error('[AI] Clipboard error:', clipboardError);
                              showNotification('error', '❌ Impossible de copier. Sélectionnez le texte manuellement.');
                            }
                          }
                          setAiPromptModal(null);
                          setAiResult(null);
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-all"
                      >
                        ✅ Appliquer / Copier
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiResult(null)}
                        className="px-3 py-2 rounded-lg bg-white/5 text-slate-400 text-xs hover:bg-white/10 transition-all"
                      >
                        Effacer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => { setAiPromptModal(null); setAiResult(null); setAiGeneratedImageUrl(null); }}
                className="px-4 py-2 rounded-lg bg-white/5 text-slate-300 text-sm hover:bg-white/10 transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </Portal>
      )}


      {/* ============================================ */}
      {/* FLOATING AI BUTTON */}
      {/* ============================================ */}
      {!aiPromptModal && (
        <button
          type="button"
          onClick={() => openAIModal({ sectionKey: 'general', variantKey: 'text', showKey: 'general' })}
          className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-110 transition-all flex items-center justify-center group"
          title="Assistant IA"
        >
          <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3" />
          </span>
        </button>
      )}

      {/* ============================================ */}
      {/* FLOATING VIEW SITE BUTTON (Mobile only - Desktop has Split View) */}
      {/* ============================================ */}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="lg:hidden fixed bottom-20 right-6 z-[9998] px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all flex items-center gap-2"
        title="Voir le site"
      >
        <Eye className="w-5 h-5" />
        <span className="text-sm font-medium">👁️ Voir</span>
      </a>
    </div>
  );
}

// ============================================
// EXPORT WITH SUSPENSE + ARCHITECTURE DETECTOR
// ============================================

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyan-500 border-t-transparent" />
      </div>
    }>
      <ArchitectureDetector>
        <AdminPageContent />
      </ArchitectureDetector>
    </Suspense>
  );
}
