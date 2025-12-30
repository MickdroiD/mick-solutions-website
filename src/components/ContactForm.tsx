'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { submitContact } from '@/app/actions/submitContact';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// Props pour rendre le formulaire configurable depuis Baserow
interface ContactFormProps {
  title?: string;
  subtitle?: string;
  submitText?: string;
  successMessage?: string;
}

export default function ContactForm({
  title = 'Contactez-nous',
  subtitle = 'Une question, un projet ? Remplissez le formulaire ci-dessous.',
  submitText = 'Envoyer le message',
  successMessage = 'Merci ! Nous vous répondrons dans les plus brefs délais.',
}: ContactFormProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const handleSubmit = async (formData: FormData) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await submitContact(formData);
      setFeedback(result);
      if (result.success) {
        const form = document.getElementById('contact-form') as HTMLFormElement;
        form?.reset();
      }
    });
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-slate-950/50 to-background" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-primary-500/10 to-transparent blur-[100px]" />

      <div ref={ref} className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {title.split(' ').slice(0, -1).join(' ')} <span className="text-gradient">{title.split(' ').slice(-1)}</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-3xl blur-xl opacity-50" />
          
          <div className="relative p-8 sm:p-10 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-xl">
            <form id="contact-form" action={handleSubmit} className="space-y-6">
              {/* Row 1: Name & Company */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="group">
                  <label htmlFor="nom" className="block text-sm font-medium text-slate-300 mb-2">
                    Nom complet <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    required
                    disabled={isPending}
                    placeholder="Jean Dupont"
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 
                             text-white placeholder-slate-500 
                             focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20
                             transition-all duration-300
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="group">
                  <label htmlFor="entreprise" className="block text-sm font-medium text-slate-300 mb-2">
                    Nom de l&apos;entreprise <span className="text-slate-500">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    id="entreprise"
                    name="entreprise"
                    disabled={isPending}
                    placeholder="Ma Société SA"
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 
                             text-white placeholder-slate-500 
                             focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20
                             transition-all duration-300
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Row 2: Email */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  disabled={isPending}
                  placeholder="jean@entreprise.ch"
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 
                           text-white placeholder-slate-500 
                           focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20
                           transition-all duration-300
                           disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Row 3: Subject/Topic select */}
              <div className="group">
                <label htmlFor="sujet" className="block text-sm font-medium text-slate-300 mb-2">
                  Sujet de votre demande <span className="text-red-400">*</span>
                </label>
                <select
                  id="sujet"
                  name="sujet"
                  required
                  disabled={isPending}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 
                           text-white 
                           focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20
                           transition-all duration-300
                           disabled:opacity-50 disabled:cursor-not-allowed
                           appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.25rem',
                  }}
                >
                  <option value="" className="bg-slate-900">Sélectionnez une option</option>
                  <option value="devis" className="bg-slate-900">Demande de devis</option>
                  <option value="info" className="bg-slate-900">Demande d&apos;information</option>
                  <option value="partenariat" className="bg-slate-900">Partenariat</option>
                  <option value="autre" className="bg-slate-900">Autre</option>
                </select>
              </div>

              {/* Row 4: Message */}
              <div className="group">
                <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                  Décrivez votre situation <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  disabled={isPending}
                  placeholder="Je passe X heures par semaine à faire Y... J'aimerais automatiser Z..."
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 
                           text-white placeholder-slate-500 resize-none
                           focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20
                           transition-all duration-300
                           disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isPending}
                whileHover={{ scale: isPending ? 1 : 1.02 }}
                whileTap={{ scale: isPending ? 1 : 0.98 }}
                className="relative w-full py-4 rounded-xl font-semibold tracking-wide
                         bg-gradient-to-r from-primary-500 to-accent-500
                         text-white shadow-xl shadow-primary-500/20
                         hover:shadow-primary-500/40
                         transition-all duration-300
                         disabled:opacity-60 disabled:cursor-not-allowed
                         overflow-hidden flex items-center justify-center gap-3"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {submitText}
                  </>
                )}
              </motion.button>

              {/* Feedback Message */}
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium
                            ${feedback.success 
                              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                              : 'bg-red-500/10 border border-red-500/30 text-red-400'
                            }`}
                >
                  {feedback.success ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  {feedback.message}
                </motion.div>
              )}
            </form>
          </div>
        </motion.div>

        {/* Privacy note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-sm text-slate-500 mt-6"
        >
          Vos données sont sécurisées et ne seront jamais partagées. 
          <br className="sm:hidden" />
          Hébergement 100% suisse.
        </motion.p>
      </div>
    </section>
  );
}
