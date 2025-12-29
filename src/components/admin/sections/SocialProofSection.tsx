'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  MessageSquare, Sparkles,
  Plus, Edit, Trash2, Star, Shield, RefreshCw, Quote, HelpCircle
} from 'lucide-react';
import { AccordionWithToggle } from '../ui/AccordionWithToggle';

// ============================================
// TYPES
// ============================================

interface SocialProofSectionProps {
  config: Record<string, unknown>;
  options: Record<string, string[]>;
  onConfigUpdate: (key: string, value: unknown) => void;
  onConfigUpdateMultiple: (updates: Record<string, unknown>) => void;
  onOpenAIModal: (context: { sectionKey: string; variantKey: string; showKey: string }) => void;
}

interface TestimonialItem {
  id: number;
  'Nom du client'?: string;
  Message?: string;
  'Poste / Entreprise'?: string;
  Note?: number;
  Photo?: Array<{ url: string; thumbnails?: { small?: { url: string } } }>;
  Afficher?: boolean;
  [key: string]: unknown;
}

interface TrustPointItem {
  id: number;
  Titre?: string;
  Description?: string;
  Icone?: string;
  Badge?: string;
  Is_Active?: boolean;
  [key: string]: unknown;
}

interface FAQItem {
  id: number;
  Question?: string;
  Reponse?: string;
  [key: string]: unknown;
}

// ============================================
// VARIANTES
// ============================================

const TESTIMONIALS_VARIANTS = [
  { id: 'Désactivé', label: 'Off', emoji: '🚫', color: 'bg-slate-500/20 border-slate-500' },
  { id: 'Minimal', label: 'Minimal', emoji: '◽', color: 'bg-blue-500/20 border-blue-500' },
  { id: 'Carousel', label: 'Carousel', emoji: '🎠', color: 'bg-rose-500/20 border-rose-500' },
  { id: 'Cards', label: 'Cartes', emoji: '🃏', color: 'bg-orange-500/20 border-orange-500' },
  { id: 'Video', label: 'Vidéo', emoji: '🎬', color: 'bg-red-500/20 border-red-500' },
];

const FAQ_VARIANTS = [
  { id: 'Désactivé', label: 'Off', emoji: '🚫', color: 'bg-slate-500/20 border-slate-500' },
  { id: 'Minimal', label: 'Minimal', emoji: '◽', color: 'bg-blue-500/20 border-blue-500' },
  { id: 'Accordion', label: 'Accordéon', emoji: '📋', color: 'bg-green-500/20 border-green-500' },
  { id: 'Tabs', label: 'Onglets', emoji: '📑', color: 'bg-indigo-500/20 border-indigo-500' },
  { id: 'Search', label: 'Recherche', emoji: '🔍', color: 'bg-teal-500/20 border-teal-500' },
];

// ============================================
// COMPOSANT
// ============================================

export default function SocialProofSection({
  config,
  // options unused for now, but kept for interface compatibility
  onConfigUpdate,
  onConfigUpdateMultiple,
  onOpenAIModal,
}: SocialProofSectionProps) {
  // ⚠️ CORRECTION: Plus de expandedSections local - géré par AccordionWithToggle
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [trustPoints, setTrustPoints] = useState<TrustPointItem[]>([]);
  const [faq, setFaq] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState({ testimonials: false, trustPoints: false, faq: false });

  const isTestimonialsActive = config.showTestimonials === true;
  const isTrustActive = config.showTrust === true;
  const isFaqActive = config.showFaq === true;
  const testimonialsVariant = String(config.testimonialsVariant || 'Carousel');
  const faqVariant = String(config.faqVariant || 'Accordion');

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchContent = useCallback(async (type: 'testimonials' | 'trustPoints' | 'faq') => {
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      const res = await fetch(`/api/admin/content?type=${type}`);
      if (res.ok) {
        const data = await res.json();
        if (type === 'testimonials') {
          setTestimonials(data.items || []);
        } else if (type === 'trustPoints') {
          setTrustPoints(data.items || []);
        } else {
          setFaq(data.items || []);
        }
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  }, []);

  useEffect(() => {
    fetchContent('testimonials');
    fetchContent('trustPoints');
    fetchContent('faq');
  }, [fetchContent]);

  // ============================================
  // RENDER STAR RATING
  // ============================================

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
        />
      ))}
    </div>
  );

  // ============================================
  // RENDER
  // ============================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">💬 Preuve Sociale</h2>
            <p className="text-slate-400">Témoignages, points de confiance et FAQ</p>
          </div>
        </div>
      </div>

      {/* Section Témoignages */}
      <AccordionWithToggle
        id="testimonials"
        title="Témoignages clients"
        emoji="💬"
        isActive={isTestimonialsActive}
        onToggle={() => onConfigUpdate('showTestimonials', !isTestimonialsActive)}
      >
        {isTestimonialsActive && (
          <>
            {/* Variante de style */}
            <div className="mb-4">
              <label className="text-white font-medium text-sm mb-3 block">Style d&apos;affichage</label>
              <div className="grid grid-cols-5 gap-2">
                {TESTIMONIALS_VARIANTS.map((variant) => {
                  const isDisabled = variant.id === 'Désactivé';
                  const isSelected = isDisabled
                    ? !isTestimonialsActive
                    : isTestimonialsActive && testimonialsVariant === variant.id;

                  return (
                    <button
                      type="button" key={variant.id}
                      onClick={() => {
                        if (isDisabled) {
                          onConfigUpdate('showTestimonials', false);
                        } else {
                          onConfigUpdateMultiple({ showTestimonials: true, testimonialsVariant: variant.id });
                        }
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                        isSelected
                          ? `${variant.color} text-white shadow-lg`
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xl mb-1">{variant.emoji}</span>
                      <span className="text-xs">{variant.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Liste des témoignages */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm">{testimonials.length} témoignage(s)</span>
              <div className="flex items-center gap-2">
                <button
                  type="button" onClick={() => fetchContent('testimonials')}
                  disabled={loading.testimonials}
                  className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${loading.testimonials ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button" onClick={() => onOpenAIModal({ sectionKey: 'testimonials', variantKey: 'testimonialsVariant', showKey: 'showTestimonials' })}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30 text-sm hover:bg-violet-500/30 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Générer
                </button>
                <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-sm hover:bg-cyan-500/30 transition-all">
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
            </div>

            {loading.testimonials ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
              </div>
            ) : testimonials.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-xl">
                <Quote className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400 mb-2">Aucun témoignage</p>
                <button
                  type="button" onClick={() => onOpenAIModal({ sectionKey: 'testimonials', variantKey: 'testimonialsVariant', showKey: 'showTestimonials' })}
                  className="text-violet-400 hover:text-violet-300 underline text-sm"
                >
                  Générer avec l&apos;IA
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {testimonials.slice(0, 4).map((item) => {
                  const photoUrl = item.Photo?.[0]?.thumbnails?.small?.url || item.Photo?.[0]?.url;
                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 bg-slate-800/50 border border-white/5 rounded-xl hover:border-cyan-500/30 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                        {photoUrl ? (
                          <Image src={photoUrl} alt="" width={48} height={48} className="w-full h-full object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 text-lg font-bold">
                            {(item['Nom du client'] || 'A').charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-medium truncate">{item['Nom du client'] || 'Client anonyme'}</p>
                          {item.Note && <StarRating rating={Number(item.Note)} />}
                          {!item.Afficher && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">Masqué</span>
                          )}
                        </div>
                        <p className="text-slate-500 text-xs mb-1">{item['Poste / Entreprise'] || ''}</p>
                        <p className="text-slate-400 text-sm line-clamp-2">&ldquo;{item.Message || ''}&rdquo;</p>
                      </div>
                      <div className="flex items-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" className="p-2 rounded-lg bg-slate-700 text-cyan-400 hover:bg-cyan-500/20 transition-all">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button type="button" className="p-2 rounded-lg bg-slate-700 text-red-400 hover:bg-red-500/20 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </AccordionWithToggle>

      {/* Section Points de confiance */}
      <AccordionWithToggle
        id="trust"
        title="Points de confiance"
        emoji="🛡️"
        isActive={isTrustActive}
        onToggle={() => onConfigUpdate('showTrust', !isTrustActive)}
      >
        {isTrustActive && (
          <>
            <div className="flex items-center gap-2 p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl mb-4">
              <Shield className="w-5 h-5 text-teal-400 flex-shrink-0" />
              <p className="text-teal-300 text-sm">
                Certifications, garanties et éléments de réassurance pour vos visiteurs.
              </p>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm">{trustPoints.length} élément(s)</span>
              <div className="flex items-center gap-2">
                <button
                  type="button" onClick={() => fetchContent('trustPoints')}
                  disabled={loading.trustPoints}
                  className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${loading.trustPoints ? 'animate-spin' : ''}`} />
                </button>
                <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-sm hover:bg-cyan-500/30 transition-all">
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
            </div>

            {loading.trustPoints ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
              </div>
            ) : trustPoints.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-xl">
                <Shield className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">Aucun point de confiance</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {trustPoints.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 bg-slate-800/50 border rounded-xl transition-all group ${
                      item.Is_Active ? 'border-white/10 hover:border-cyan-500/30' : 'border-amber-500/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center text-xl">
                        {item.Icone || '✓'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{item.Titre || 'Sans titre'}</p>
                        <p className="text-slate-500 text-sm line-clamp-2">{item.Description || ''}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </AccordionWithToggle>

      {/* Section FAQ */}
      <AccordionWithToggle
        id="faq"
        title="Questions fréquentes (FAQ)"
        emoji="❓"
        isActive={isFaqActive}
        onToggle={() => onConfigUpdate('showFaq', !isFaqActive)}
      >
        {isFaqActive && (
          <>
            {/* Variante de style */}
            <div className="mb-4">
              <label className="text-white font-medium text-sm mb-3 block">Style d&apos;affichage</label>
              <div className="grid grid-cols-5 gap-2">
                {FAQ_VARIANTS.map((variant) => {
                  const isDisabled = variant.id === 'Désactivé';
                  const isSelected = isDisabled
                    ? !isFaqActive
                    : isFaqActive && faqVariant === variant.id;

                  return (
                    <button
                      type="button" key={variant.id}
                      onClick={() => {
                        if (isDisabled) {
                          onConfigUpdate('showFaq', false);
                        } else {
                          onConfigUpdateMultiple({ showFaq: true, faqVariant: variant.id });
                        }
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                        isSelected
                          ? `${variant.color} text-white shadow-lg`
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xl mb-1">{variant.emoji}</span>
                      <span className="text-xs">{variant.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm">{faq.length} question(s)</span>
              <div className="flex items-center gap-2">
                <button
                  type="button" onClick={() => fetchContent('faq')}
                  disabled={loading.faq}
                  className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${loading.faq ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button" onClick={() => onOpenAIModal({ sectionKey: 'faq', variantKey: 'faqVariant', showKey: 'showFaq' })}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30 text-sm hover:bg-violet-500/30 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Générer
                </button>
                <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-sm hover:bg-cyan-500/30 transition-all">
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
            </div>

            {loading.faq ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
              </div>
            ) : faq.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-xl">
                <HelpCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400 mb-2">Aucune question FAQ</p>
                <button
                  type="button" onClick={() => onOpenAIModal({ sectionKey: 'faq', variantKey: 'faqVariant', showKey: 'showFaq' })}
                  className="text-violet-400 hover:text-violet-300 underline text-sm"
                >
                  Générer avec l&apos;IA
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {faq.slice(0, 5).map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-800/50 border border-white/5 rounded-xl hover:border-cyan-500/30 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium">{item.Question || 'Question sans titre'}</p>
                        <p className="text-slate-500 text-sm line-clamp-2 mt-1">{item.Reponse || ''}</p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" className="p-2 rounded-lg bg-slate-700 text-cyan-400 hover:bg-cyan-500/20 transition-all">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button type="button" className="p-2 rounded-lg bg-slate-700 text-red-400 hover:bg-red-500/20 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {faq.length > 5 && (
                  <p className="text-center text-slate-500 text-sm py-2">
                    + {faq.length - 5} autres questions
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </AccordionWithToggle>
    </motion.div>
  );
}

