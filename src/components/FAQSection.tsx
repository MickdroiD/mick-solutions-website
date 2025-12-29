'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import type { FAQ } from '@/lib/baserow';

// ============================================
// PROPS INTERFACE
// ============================================

interface FAQSectionProps {
  faqItems: FAQ[];
  variant?: 'Minimal' | 'Accordion' | 'Tabs' | 'Search' | 'AI';
}

// ============================================
// ACCORDION ITEM
// ============================================

function AccordionItem({
  item,
  isOpen,
  onToggle,
  index,
}: {
  item: FAQ;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group"
    >
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-5 rounded-xl text-left transition-all duration-300 ${
          isOpen
            ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 border border-primary-500/30'
            : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
        }`}
      >
        <span className={`font-medium pr-4 ${isOpen ? 'text-white' : 'text-slate-300'}`}>
          {item.Question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className={`flex-shrink-0 ${isOpen ? 'text-primary-400' : 'text-slate-500'}`}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-5 text-slate-400 leading-relaxed border-l-2 border-primary-500/30 ml-4 mt-2">
              {item.Reponse}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function FAQSection({ faqItems, variant = 'Accordion' }: FAQSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Ne pas rendre si pas de FAQ
  if (!faqItems || faqItems.length === 0) {
    return null;
  }

  // Filtrer les FAQ si recherche active
  const filteredFaq = searchQuery
    ? faqItems.filter(
        (item) =>
          item.Question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.Reponse.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqItems;

  return (
    <section id="faq" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-slate-950/50 to-background" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-500/5 rounded-full blur-[120px]" />

      <div ref={ref} className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6">
            <HelpCircle className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-300">Questions fréquentes</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            On répond à vos <span className="text-gradient">questions</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur nos services.
          </p>
        </motion.div>

        {/* Search bar for Search variant */}
        {variant === 'Search' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <input
              type="text"
              placeholder="Rechercher une question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 transition-all"
            />
          </motion.div>
        )}

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          {filteredFaq.map((item, index) => (
            <AccordionItem
              key={item.id}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </motion.div>

        {/* No results */}
        {searchQuery && filteredFaq.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-slate-500">Aucune question ne correspond à votre recherche.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

