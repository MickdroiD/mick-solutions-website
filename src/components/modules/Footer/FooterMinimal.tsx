'use client';

import { motion } from 'framer-motion';
import type { FooterModuleProps } from '../types';

/**
 * FooterMinimal - Variante épurée et discrète.
 * 
 * @description Footer sur une seule ligne avec logo, copyright,
 * et liens légaux. Idéal pour portfolios, landing pages simples.
 */
export function FooterMinimal({ config, legalDocs = [] }: FooterModuleProps) {
  const currentYear = new Date().getFullYear();
  
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-6 px-6 border-t border-primary-100 dark:border-primary-900/50"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo / Nom du site */}
        <span className="text-sm text-primary-700 dark:text-primary-300">
          {config.nomSite}
        </span>

        {/* Copyright */}
        <p className="text-xs text-primary-500 dark:text-primary-500">
          © {currentYear} {config.nomSite}
        </p>

        {/* Liens légaux */}
        <div className="flex items-center gap-4">
          {config.showLegalLinks && legalDocs.filter(d => d.isActive).map((doc) => (
            <a
              key={doc.id}
              href={`/legal/${doc.slug}`}
              className="text-xs text-primary-500 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              {doc.titre}
            </a>
          ))}
        </div>
      </div>
    </motion.footer>
  );
}

