'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Palette, Layout, Search, Share2, 
  Save, RotateCcw, Check, Lock, Sparkles, 
  Globe, Home, Type,
  Menu, X, LogOut, RefreshCw, AlertCircle,
  Monitor, Phone, ExternalLink, Bell,
  Upload, Trash2, Link2
} from 'lucide-react';

// Types pour la config
interface AdminConfig {
  [key: string]: string | boolean | undefined;
  nomSite: string;
  slogan: string;
  initialesLogo: string;
  logoUrl: string;
  couleurPrimaire: string;
  couleurAccent: string;
  showNavbar: boolean;
  showHero: boolean;
  showAdvantages: boolean;
  showServices: boolean;
  showPortfolio: boolean;
  showTrust: boolean;
  showContact: boolean;
  showFaq: boolean;
  showGallery: boolean;
  showFooter: boolean;
  themeGlobal: string;
  navbarVariant: string;
  heroVariant: string;
  footerVariant: string;
  metaTitre: string;
  metaDescription: string;
  motsCles: string;
  email: string;
  telephone: string;
  adresse: string;
  lienLinkedin: string;
  titreHero: string;
  sousTitreHero: string;
  badgeHero: string;
  ctaPrincipal: string;
  ctaSecondaire: string;
}

// Configuration des sections
interface Field {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'color' | 'toggle' | 'select' | 'url' | 'image';
  options?: string[];
  placeholder?: string;
  hint?: string;
  category?: string; // Pour l'upload d'images (logo, favicon, etc.)
}

interface Section {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  emoji: string;
  color: string;
  fields: Field[];
}

// PIN d'accès (à personnaliser)
const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '1234';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const [pinError, setPinError] = useState(false);
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [originalConfig, setOriginalConfig] = useState<AdminConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeSection, setActiveSection] = useState('home');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null); // Clé du champ en cours d'upload
  const [uploadMode, setUploadMode] = useState<Record<string, 'upload' | 'url'>>({});

  // Sections de configuration
  const sections: Section[] = [
    {
      id: 'home',
      title: 'Tableau de bord',
      subtitle: 'Vue d\'ensemble',
      icon: Home,
      emoji: '🏠',
      color: 'from-blue-500 to-cyan-500',
      fields: [],
    },
    {
      id: 'identity',
      title: 'Identité',
      subtitle: 'Nom, logo, slogan',
      icon: Globe,
      emoji: '🎯',
      color: 'from-violet-500 to-purple-500',
      fields: [
        { key: 'nomSite', label: 'Nom du site', type: 'text', placeholder: 'Mon Entreprise', hint: 'Apparaît dans le header et le SEO' },
        { key: 'slogan', label: 'Slogan', type: 'textarea', placeholder: 'Votre accroche...', hint: 'Phrase d\'accroche principale' },
        { key: 'initialesLogo', label: 'Initiales', type: 'text', placeholder: 'ME', hint: 'Utilisées si pas de logo' },
        { key: 'logoUrl', label: 'Logo', type: 'image', placeholder: 'https://...', hint: 'Uploadez une image ou collez une URL', category: 'logos' },
      ],
    },
    {
      id: 'design',
      title: 'Design',
      subtitle: 'Couleurs et style',
      icon: Palette,
      emoji: '🎨',
      color: 'from-pink-500 to-rose-500',
      fields: [
        { key: 'couleurPrimaire', label: 'Couleur principale', type: 'color', hint: 'Utilisée pour les boutons et accents' },
        { key: 'couleurAccent', label: 'Couleur accent', type: 'color', hint: 'Pour les éléments secondaires' },
        { key: 'themeGlobal', label: 'Style global', type: 'select', options: ['Minimal', 'Corporate', 'Electric', 'Bold'], hint: 'Définit l\'ambiance générale' },
      ],
    },
    {
      id: 'hero',
      title: 'Section Hero',
      subtitle: 'Première impression',
      icon: Type,
      emoji: '✨',
      color: 'from-amber-500 to-orange-500',
      fields: [
        { key: 'badgeHero', label: 'Badge', type: 'text', placeholder: 'Nouveau!', hint: 'Petit texte au-dessus du titre' },
        { key: 'titreHero', label: 'Titre principal', type: 'textarea', placeholder: 'Votre titre accrocheur', hint: 'Le gros titre de la page' },
        { key: 'sousTitreHero', label: 'Sous-titre', type: 'textarea', placeholder: 'Description courte...', hint: 'Explication en 1-2 phrases' },
        { key: 'ctaPrincipal', label: 'Bouton principal', type: 'text', placeholder: 'Commencer', hint: 'Texte du bouton principal' },
        { key: 'ctaSecondaire', label: 'Bouton secondaire', type: 'text', placeholder: 'En savoir plus', hint: 'Texte du bouton secondaire' },
        { key: 'heroVariant', label: 'Style du Hero', type: 'select', options: ['Minimal', 'Corporate', 'Electric', 'Bold'], hint: 'Apparence de la section Hero' },
      ],
    },
    {
      id: 'modules',
      title: 'Sections',
      subtitle: 'Activer/désactiver',
      icon: Layout,
      emoji: '🧩',
      color: 'from-emerald-500 to-teal-500',
      fields: [
        { key: 'showNavbar', label: 'Navigation', type: 'toggle', hint: 'Menu de navigation en haut' },
        { key: 'showHero', label: 'Section Hero', type: 'toggle', hint: 'Grande bannière d\'accueil' },
        { key: 'showAdvantages', label: 'Avantages', type: 'toggle', hint: 'Liste de vos points forts' },
        { key: 'showServices', label: 'Services', type: 'toggle', hint: 'Vos offres et prestations' },
        { key: 'showPortfolio', label: 'Portfolio', type: 'toggle', hint: 'Galerie de vos réalisations' },
        { key: 'showTrust', label: 'Confiance', type: 'toggle', hint: 'Témoignages et avis clients' },
        { key: 'showFaq', label: 'FAQ', type: 'toggle', hint: 'Questions fréquentes' },
        { key: 'showContact', label: 'Contact', type: 'toggle', hint: 'Formulaire de contact' },
        { key: 'showGallery', label: 'Galerie', type: 'toggle', hint: 'Photos et images' },
        { key: 'showFooter', label: 'Pied de page', type: 'toggle', hint: 'Footer avec liens' },
      ],
    },
    {
      id: 'variants',
      title: 'Apparences',
      subtitle: 'Styles des modules',
      icon: Sparkles,
      emoji: '💫',
      color: 'from-indigo-500 to-blue-500',
      fields: [
        { key: 'navbarVariant', label: 'Style navigation', type: 'select', options: ['Minimal', 'Corporate', 'Electric', 'Bold', 'Centered'], hint: 'Apparence du menu' },
        { key: 'footerVariant', label: 'Style footer', type: 'select', options: ['Minimal', 'Corporate', 'Electric', 'Bold', 'Mega'], hint: 'Apparence du pied de page' },
      ],
    },
    {
      id: 'seo',
      title: 'SEO',
      subtitle: 'Référencement Google',
      icon: Search,
      emoji: '🔍',
      color: 'from-cyan-500 to-blue-500',
      fields: [
        { key: 'metaTitre', label: 'Titre SEO', type: 'text', placeholder: 'Mon Site | Description', hint: 'Apparaît dans l\'onglet du navigateur' },
        { key: 'metaDescription', label: 'Description SEO', type: 'textarea', placeholder: 'Description de votre site...', hint: 'Résumé pour Google (160 caractères)' },
        { key: 'motsCles', label: 'Mots-clés', type: 'text', placeholder: 'mot1, mot2, mot3', hint: 'Séparés par des virgules' },
      ],
    },
    {
      id: 'contact',
      title: 'Contact',
      subtitle: 'Vos coordonnées',
      icon: Share2,
      emoji: '📞',
      color: 'from-green-500 to-emerald-500',
      fields: [
        { key: 'email', label: 'Email', type: 'text', placeholder: 'contact@exemple.ch', hint: 'Email de contact principal' },
        { key: 'telephone', label: 'Téléphone', type: 'text', placeholder: '+41 22 123 45 67', hint: 'Numéro avec indicatif' },
        { key: 'adresse', label: 'Adresse', type: 'text', placeholder: 'Genève, Suisse', hint: 'Ville ou adresse complète' },
        { key: 'lienLinkedin', label: 'LinkedIn', type: 'url', placeholder: 'https://linkedin.com/...', hint: 'Lien vers votre profil' },
      ],
    },
  ];

  // Charger la config
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/config');
      if (!res.ok) throw new Error('Erreur serveur');
      const data = await res.json();
      setConfig(data);
      setOriginalConfig(data);
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('error', 'Impossible de charger la configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConfig();
    }
  }, [isAuthenticated, fetchConfig]);

  // Check session
  useEffect(() => {
    const session = sessionStorage.getItem('admin_authenticated');
    if (session === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // PIN handlers
  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setPinError(false);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when complete
    if (index === 3 && value) {
      const fullPin = [...newPin.slice(0, 3), value].join('');
      if (fullPin === ADMIN_PIN) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_authenticated', 'true');
      } else {
        setPinError(true);
        setPin(['', '', '', '']);
        document.getElementById('pin-0')?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Save config
  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setOriginalConfig(config);
        showNotification('success', 'Modifications enregistrées !');
      } else {
        throw new Error('Erreur serveur');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('error', 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (originalConfig) {
      setConfig(originalConfig);
      showNotification('success', 'Modifications annulées');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
    setConfig(null);
    setPin(['', '', '', '']);
  };

  const hasChanges = JSON.stringify(config) !== JSON.stringify(originalConfig);

  const updateConfig = (key: string, value: string | boolean) => {
    if (config) {
      setConfig({ ...config, [key]: value });
    }
  };

  // Upload d'images
  const handleImageUpload = async (key: string, file: File, category: string = 'general') => {
    setUploading(key);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur upload');
      }

      const data = await res.json();
      updateConfig(key, data.url);
      showNotification('success', 'Image uploadée avec succès !');
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('error', error instanceof Error ? error.message : 'Erreur lors de l\'upload');
    } finally {
      setUploading(null);
    }
  };

  // ==================== ÉCRAN DE LOGIN ====================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm"
        >
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Logo */}
            <div className="text-center mb-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/25"
              >
                <Lock className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-1">Panneau Admin</h1>
              <p className="text-slate-400 text-sm">Entrez votre code PIN</p>
            </div>

            {/* PIN Input */}
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map((index) => (
                <motion.input
                  key={index}
                  id={`pin-${index}`}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={pin[index]}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-14 h-16 text-center text-2xl font-bold bg-white/5 border-2 ${
                    pinError ? 'border-red-500 animate-shake' : 'border-white/10 focus:border-cyan-500'
                  } rounded-xl text-white focus:outline-none transition-all`}
                />
              ))}
            </div>

            {/* Error message */}
            <AnimatePresence>
              {pinError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2 text-red-400 text-sm mb-4"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Code incorrect, réessayez</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <p className="text-center text-slate-500 text-xs mt-6">
              White Label Factory &bull; Admin Panel
            </p>
          </div>
        </motion.div>

        {/* Background decoration */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
        </div>
      </div>
    );
  }

  // ==================== ÉCRAN DE CHARGEMENT ====================
  if (loading || !config) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw className="w-8 h-8 text-cyan-500" />
        </motion.div>
        <p className="text-slate-400">Chargement...</p>
      </div>
    );
  }

  const currentSection = sections.find(s => s.id === activeSection) || sections[0];

  // ==================== INTERFACE PRINCIPALE ====================
  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* ========== SIDEBAR (Desktop) ========== */}
      <aside className="hidden lg:flex w-64 flex-col bg-slate-800/50 border-r border-white/5">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            {/* Le Logo avec animation de rotation */}
            <div className="relative h-10 w-10 flex items-center justify-center">
              {config.logoUrl ? (
                <Image 
                  src={config.logoUrl}
                  alt="Logo"
                  width={40}
                  height={40}
                  className="object-contain animate-[spin_10s_linear_infinite]"
                />
              ) : (
                <Image 
                  src="/icon.svg"
                  alt="Mick Solutions Logo"
                  width={40}
                  height={40}
                  className="object-contain animate-[spin_10s_linear_infinite]"
                />
              )}
            </div>
            {/* Le Texte */}
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight text-white">{config.nomSite || 'Admin'}</span>
              <span className="text-xs text-slate-500 font-medium">Administration</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeSection === section.id
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-lg">{section.emoji}</span>
              <span className="text-sm font-medium">{section.title}</span>
            </button>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all"
          >
            <ExternalLink className="w-5 h-5" />
            <span className="text-sm">Voir le site</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-white/5">
          <div className="px-4 lg:px-8 h-16 flex items-center justify-between">
            {/* Left: Menu button (mobile) + Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-white/5"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <span className="text-xl">{currentSection.emoji}</span>
                  {currentSection.title}
                </h2>
                <p className="text-slate-500 text-xs hidden sm:block">{currentSection.subtitle}</p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Preview toggle */}
              <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded-md transition-colors ${
                    previewMode === 'desktop' ? 'bg-white/10 text-white' : 'text-slate-500'
                  }`}
                  title="Vue desktop"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded-md transition-colors ${
                    previewMode === 'mobile' ? 'bg-white/10 text-white' : 'text-slate-500'
                  }`}
                  title="Vue mobile"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </div>

              {/* Reset */}
              {hasChanges && (
                <button
                  onClick={handleReset}
                  className="p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                  title="Annuler les modifications"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  hasChanges
                    ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40'
                    : 'bg-white/5 text-slate-500 cursor-not-allowed'
                }`}
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{hasChanges ? 'Enregistrer' : 'À jour'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* ========== HOME DASHBOARD ========== */}
            {activeSection === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Welcome card */}
                <div className="bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Bienvenue, {config.nomSite} ! 👋
                  </h3>
                  <p className="text-slate-300">
                    Gérez votre site web depuis cette interface. Toutes vos modifications sont enregistrées automatiquement dans la base de données.
                  </p>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Sections actives', value: Object.entries(config).filter(([k, v]) => k.startsWith('show') && v === true).length, emoji: '📦' },
                    { label: 'Style', value: config.themeGlobal || 'Electric', emoji: '🎨' },
                    { label: 'Navbar', value: config.navbarVariant || 'Auto', emoji: '📱' },
                    { label: 'Footer', value: config.footerVariant || 'Auto', emoji: '📄' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <span className="text-2xl mb-2 block">{stat.emoji}</span>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-slate-500 text-sm">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sections.slice(1).map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-left group"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center shadow-lg`}>
                        <section.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium group-hover:text-cyan-400 transition-colors">{section.title}</p>
                        <p className="text-slate-500 text-sm">{section.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Preview avec iframe intégrée */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h4 className="text-white font-medium">Aperçu en direct</h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                        Live
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Toggle desktop/mobile */}
                      <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
                        <button
                          onClick={() => setPreviewMode('desktop')}
                          className={`p-2 rounded-md transition-colors ${
                            previewMode === 'desktop' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'
                          }`}
                          title="Vue desktop"
                        >
                          <Monitor className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPreviewMode('mobile')}
                          className={`p-2 rounded-md transition-colors ${
                            previewMode === 'mobile' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'
                          }`}
                          title="Vue mobile"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                      </div>
                      {/* Bouton rafraîchir */}
                      <button
                        onClick={() => {
                          const iframe = document.getElementById('site-preview') as HTMLIFrameElement;
                          if (iframe) {
                            iframe.src = iframe.src;
                          }
                        }}
                        className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                        title="Rafraîchir l'aperçu"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      {/* Ouvrir dans un nouvel onglet */}
                      <a
                        href="/"
                        target="_blank"
                        className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-all"
                        title="Ouvrir dans un nouvel onglet"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  
                  {/* Container de l'iframe avec effet de device */}
                  <div className={`relative transition-all duration-300 ${
                    previewMode === 'mobile' 
                      ? 'max-w-[375px] mx-auto' 
                      : 'w-full'
                  }`}>
                    {/* Barre de navigateur simulée */}
                    <div className="bg-slate-800 rounded-t-xl px-4 py-2 flex items-center gap-3 border-b border-white/5">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                      </div>
                      <div className="flex-1 bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-400 font-mono truncate">
                        {typeof window !== 'undefined' ? window.location.origin : 'https://votre-site.ch'}
                      </div>
                    </div>
                    
                    {/* Iframe */}
                    <div className={`bg-white rounded-b-xl overflow-hidden ${
                      previewMode === 'mobile' ? 'h-[667px]' : 'h-[500px]'
                    }`}>
                      <iframe
                        id="site-preview"
                        src="/"
                        className="w-full h-full border-0"
                        title="Aperçu du site"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  
                  {/* Info */}
                  <p className="text-slate-500 text-xs text-center mt-4">
                    💡 Les modifications sont visibles après avoir cliqué sur &quot;Enregistrer&quot; puis rafraîchi l&apos;aperçu
                  </p>
                </div>
              </motion.div>
            )}

            {/* ========== SECTION EDITOR ========== */}
            {activeSection !== 'home' && (
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6 max-w-2xl"
              >
                {/* Section header */}
                <div className={`bg-gradient-to-br ${currentSection.color} rounded-2xl p-6`}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                      <currentSection.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{currentSection.title}</h3>
                      <p className="text-white/70">{currentSection.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-4">
                  {currentSection.fields.map((field) => (
                    <div
                      key={field.key}
                      className="bg-white/5 border border-white/10 rounded-xl p-4"
                    >
                      <label className="block text-white font-medium mb-1">
                        {field.label}
                      </label>
                      {field.hint && (
                        <p className="text-slate-500 text-sm mb-3">{field.hint}</p>
                      )}
                      
                      {/* Text input */}
                      {(field.type === 'text' || field.type === 'url') && (
                        <input
                          type={field.type === 'url' ? 'url' : 'text'}
                          value={String(config[field.key] ?? '')}
                          onChange={(e) => updateConfig(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        />
                      )}
                      
                      {/* Image upload/URL field */}
                      {field.type === 'image' && (
                        <div className="space-y-3">
                          {/* Toggle Upload/URL */}
                          <div className="flex gap-2 mb-3">
                            <button
                              type="button"
                              onClick={() => setUploadMode(prev => ({ ...prev, [field.key]: 'upload' }))}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                (uploadMode[field.key] || 'upload') === 'upload'
                                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                  : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                              }`}
                            >
                              <Upload className="w-4 h-4" />
                              Uploader
                            </button>
                            <button
                              type="button"
                              onClick={() => setUploadMode(prev => ({ ...prev, [field.key]: 'url' }))}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                uploadMode[field.key] === 'url'
                                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                  : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                              }`}
                            >
                              <Link2 className="w-4 h-4" />
                              URL
                            </button>
                          </div>

                          {/* Mode Upload */}
                          {(uploadMode[field.key] || 'upload') === 'upload' && (
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageUpload(field.key, file, field.category || 'general');
                                  }
                                }}
                                className="hidden"
                                id={`upload-${field.key}`}
                                disabled={uploading === field.key}
                              />
                              <label
                                htmlFor={`upload-${field.key}`}
                                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                                  uploading === field.key
                                    ? 'border-cyan-500 bg-cyan-500/10'
                                    : 'border-white/20 hover:border-cyan-500/50 hover:bg-white/5'
                                }`}
                              >
                                {uploading === field.key ? (
                                  <div className="flex items-center gap-3">
                                    <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                                    <span className="text-cyan-400 font-medium">Upload en cours...</span>
                                  </div>
                                ) : (
                                  <>
                                    <Upload className="w-8 h-8 text-slate-500 mb-2" />
                                    <span className="text-slate-400 text-sm">Cliquez ou glissez une image</span>
                                    <span className="text-slate-600 text-xs mt-1">PNG, JPG, SVG, WebP (max 10MB)</span>
                                  </>
                                )}
                              </label>
                            </div>
                          )}

                          {/* Mode URL */}
                          {uploadMode[field.key] === 'url' && (
                            <input
                              type="url"
                              value={String(config[field.key] ?? '')}
                              onChange={(e) => updateConfig(field.key, e.target.value)}
                              placeholder="https://exemple.com/mon-logo.png"
                              className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                            />
                          )}

                          {/* Preview de l'image actuelle */}
                          {config[field.key] && String(config[field.key]).length > 0 && (
                            <div className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl border border-white/10">
                              <div className="relative w-16 h-16 bg-white/10 rounded-lg overflow-hidden flex items-center justify-center">
                                <Image
                                  src={String(config[field.key])}
                                  alt="Preview"
                                  width={64}
                                  height={64}
                                  className="object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">Image actuelle</p>
                                <p className="text-slate-500 text-xs truncate">{String(config[field.key])}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => updateConfig(field.key, '')}
                                className="p-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                                title="Supprimer l'image"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Textarea */}
                      {field.type === 'textarea' && (
                        <textarea
                          value={String(config[field.key] ?? '')}
                          onChange={(e) => updateConfig(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          rows={3}
                          className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                        />
                      )}
                      
                      {/* Color picker */}
                      {field.type === 'color' && (
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <input
                              type="color"
                              value={String(config[field.key] ?? '#06b6d4')}
                              onChange={(e) => updateConfig(field.key, e.target.value)}
                              className="w-16 h-16 rounded-xl border-2 border-white/10 cursor-pointer"
                            />
                          </div>
                          <input
                            type="text"
                            value={String(config[field.key] ?? '')}
                            onChange={(e) => updateConfig(field.key, e.target.value)}
                            className="flex-1 px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-cyan-500 transition-all"
                            placeholder="#000000"
                          />
                        </div>
                      )}
                      
                      {/* Toggle */}
                      {field.type === 'toggle' && (
                        <button
                          onClick={() => updateConfig(field.key, !config[field.key])}
                          className={`relative w-16 h-9 rounded-full transition-all ${
                            config[field.key]
                              ? 'bg-gradient-to-r from-cyan-500 to-violet-500'
                              : 'bg-slate-700'
                          }`}
                        >
                          <motion.div
                            layout
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="absolute top-1.5 w-6 h-6 bg-white rounded-full shadow-lg"
                            style={{
                              left: config[field.key] ? 'calc(100% - 30px)' : '6px',
                            }}
                          />
                        </button>
                      )}
                      
                      {/* Select */}
                      {field.type === 'select' && (
                        <select
                          value={String(config[field.key] ?? '')}
                          onChange={(e) => updateConfig(field.key, e.target.value)}
                          className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer"
                          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundSize: '1.5rem', backgroundRepeat: 'no-repeat' }}
                        >
                          <option value="" className="bg-slate-800">Automatique (thème global)</option>
                          {field.options?.map((option) => (
                            <option key={option} value={option} className="bg-slate-800">
                              {option}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========== BOTTOM NAV (Mobile) ========== */}
        <nav className="lg:hidden sticky bottom-0 bg-slate-800/90 backdrop-blur-xl border-t border-white/5 safe-area-inset-bottom">
          <div className="flex justify-around py-2">
            {sections.slice(0, 5).map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  activeSection === section.id ? 'text-cyan-400' : 'text-slate-500'
                }`}
              >
                <span className="text-xl">{section.emoji}</span>
                <span className="text-[10px]">{section.id === 'home' ? 'Accueil' : section.title.slice(0, 6)}</span>
              </button>
            ))}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-500"
            >
              <span className="text-xl">⋯</span>
              <span className="text-[10px]">Plus</span>
            </button>
          </div>
        </nav>
      </main>

      {/* ========== MOBILE SIDEBAR ========== */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            {/* Sidebar */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-slate-800 z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Le Logo avec animation de rotation */}
                  <div className="relative h-10 w-10 flex items-center justify-center">
                    {config.logoUrl ? (
                      <Image 
                        src={config.logoUrl}
                        alt="Logo"
                        width={40}
                        height={40}
                        className="object-contain animate-[spin_10s_linear_infinite]"
                      />
                    ) : (
                      <Image 
                        src="/icon.svg"
                        alt="Mick Solutions Logo"
                        width={40}
                        height={40}
                        className="object-contain animate-[spin_10s_linear_infinite]"
                      />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm leading-tight text-white">{config.nomSite || 'Admin'}</span>
                    <span className="text-xs text-slate-500 font-medium">Administration</span>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:bg-white/5"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Nav items */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeSection === section.id
                        ? 'bg-white/10 text-white'
                        : 'text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-lg">{section.emoji}</span>
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-white/5 space-y-2">
                <a
                  href="/"
                  target="_blank"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span className="text-sm">Voir le site</span>
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">Déconnexion</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ========== NOTIFICATION TOAST ========== */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-24 lg:bottom-8 left-1/2 px-6 py-3 rounded-full shadow-xl flex items-center gap-3 z-50 ${
              notification.type === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {notification.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== UNSAVED CHANGES INDICATOR ========== */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 bg-amber-500 text-amber-900 px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-sm font-medium z-40"
          >
            <Bell className="w-4 h-4" />
            Modifications non enregistrées
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background effects */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
