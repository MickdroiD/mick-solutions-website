'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { FooterModuleProps } from '../types';

/**
 * FooterBold - Variante audacieuse et impactante.
 * 
 * @description Footer avec grande typographie, CTA imposant,
 * fond contrasté. Idéal pour agences créatives, landing pages.
 */
export function FooterBold({ config, legalDocs = [] }: FooterModuleProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-500 text-background dark:text-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* CTA massif */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-20 md:py-32 border-b border-background/20"
        >
          <a
            href="#contact"
            className="group block"
          >
            <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight leading-none">
              Travaillons
              <br />
              <span className="flex items-center gap-4">
                Ensemble
                <ArrowUpRight className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 
                                       transform group-hover:translate-x-2 group-hover:-translate-y-2 
                                       transition-transform duration-300" />
              </span>
            </h2>
          </a>
        </motion.div>

        {/* Info row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {/* Email */}
          <div>
            <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Email</p>
            <a 
              href={`mailto:${config.email}`}
              className="text-lg font-medium hover:opacity-70 transition-opacity"
            >
              {config.email}
            </a>
          </div>

          {/* Adresse */}
          <div>
            <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Adresse</p>
            <p className="text-lg font-medium">
              {config.adresseCourte || config.adresse.split(',')[0]}
            </p>
          </div>

          {/* Social */}
          <div>
            <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Social</p>
            <div className="flex gap-4">
              {config.lienLinkedin && (
                <a href={config.lienLinkedin} target="_blank" rel="noopener noreferrer" className="text-lg font-medium hover:opacity-70">
                  Li
                </a>
              )}
              {config.lienInstagram && (
                <a href={config.lienInstagram} target="_blank" rel="noopener noreferrer" className="text-lg font-medium hover:opacity-70">
                  Ig
                </a>
              )}
              {config.lienTwitter && (
                <a href={config.lienTwitter} target="_blank" rel="noopener noreferrer" className="text-lg font-medium hover:opacity-70">
                  X
                </a>
              )}
            </div>
          </div>

          {/* Légal */}
          <div>
            <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Légal</p>
            <div className="flex flex-wrap gap-4">
              {legalDocs.filter(d => d.isActive).map((doc) => (
                <a
                  key={doc.id}
                  href={`/legal/${doc.slug}`}
                  className="text-sm font-medium hover:opacity-70 transition-opacity"
                >
                  {doc.titre}
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Copyright bar */}
        <div className="py-6 border-t border-background/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm font-medium">
            {config.nomSite}
          </p>
          <p className="text-xs opacity-60">
            © {currentYear} — {config.paysHebergement}
          </p>
        </div>
      </div>
    </footer>
  );
}

