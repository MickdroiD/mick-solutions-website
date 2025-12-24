'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Linkedin, Instagram, Twitter } from 'lucide-react';
import Image from 'next/image';
import type { FooterModuleProps } from '../types';

/**
 * FooterCorporate - Variante professionnelle multi-colonnes.
 * 
 * @description Footer structuré avec colonnes (Contact, Navigation, Légal),
 * newsletter, réseaux sociaux. Idéal pour entreprises B2B, institutions.
 */
export function FooterCorporate({ config, legalDocs = [] }: FooterModuleProps) {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { name: 'Avantages', href: '#avantages' },
    { name: 'Services', href: '#services' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Contact', href: '#contact' },
  ];

  const socialLinks = [
    { icon: Linkedin, url: config.lienLinkedin, label: 'LinkedIn' },
    { icon: Instagram, url: config.lienInstagram, label: 'Instagram' },
    { icon: Twitter, url: config.lienTwitter, label: 'Twitter' },
  ].filter(s => s.url);

  return (
    <footer className="bg-primary-50 dark:bg-primary-950/50 border-t border-primary-200 dark:border-primary-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Colonne 1 : À propos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              {config.logoUrl && (
                <Image
                  src={config.logoUrl}
                  alt={config.nomSite}
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              )}
              <span className="font-semibold text-lg text-primary-900 dark:text-foreground">
                {config.nomSite}
              </span>
            </div>
            <p className="text-sm text-primary-600 dark:text-primary-400 mb-6">
              {config.slogan}
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900 
                             flex items-center justify-center text-primary-600 dark:text-primary-400
                             hover:bg-primary-500 hover:text-white transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            )}
          </motion.div>

          {/* Colonne 2 : Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-semibold text-primary-900 dark:text-foreground mb-4">
              Navigation
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Colonne 3 : Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-semibold text-primary-900 dark:text-foreground mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-primary-600 dark:text-primary-400">
                <Mail className="w-4 h-4 text-primary-500" />
                <a href={`mailto:${config.email}`} className="hover:text-primary-500 transition-colors">
                  {config.email}
                </a>
              </li>
              {config.telephone && (
                <li className="flex items-center gap-3 text-sm text-primary-600 dark:text-primary-400">
                  <Phone className="w-4 h-4 text-primary-500" />
                  <a href={`tel:${config.telephone}`} className="hover:text-primary-500 transition-colors">
                    {config.telephone}
                  </a>
                </li>
              )}
              <li className="flex items-start gap-3 text-sm text-primary-600 dark:text-primary-400">
                <MapPin className="w-4 h-4 text-primary-500 mt-0.5" />
                <span>{config.adresse}</span>
              </li>
            </ul>
          </motion.div>

          {/* Colonne 4 : Légal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-semibold text-primary-900 dark:text-foreground mb-4">
              Légal
            </h4>
            <ul className="space-y-3">
              {legalDocs.filter(d => d.isActive).map((doc) => (
                <li key={doc.id}>
                  <a
                    href={`/legal/${doc.slug}`}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors"
                  >
                    {doc.titre}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Barre du bas */}
        <div className="mt-12 pt-8 border-t border-primary-200 dark:border-primary-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-500">
            © {currentYear} {config.nomSite}. Tous droits réservés.
          </p>
          <p className="text-xs text-primary-500">
            {config.paysHebergement}
          </p>
        </div>
      </div>
    </footer>
  );
}

