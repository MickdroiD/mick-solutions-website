'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { GlobalSettings, LegalDoc } from '@/lib/baserow';

const navItems = [
  { name: 'Avantages', id: 'avantages' },
  { name: 'Services', id: 'services' },
  { name: 'Portfolio', id: 'portfolio' },
  { name: 'Confiance', id: 'confiance' },
  { name: 'Contact', id: 'contact' },
];

interface FooterProps {
  globalSettings: GlobalSettings | null;
  legalDocs?: LegalDoc[] | null;
}

export default function Footer({ globalSettings, legalDocs }: FooterProps) {
  // Valeurs par défaut
  const email = globalSettings?.email || 'contact@mick-solutions.ch';
  const telephone = globalSettings?.telephone || '';
  const lienLinkedin = globalSettings?.lienLinkedin || 'https://linkedin.com/company/mick-solutions';

  // Navigation programmatique compatible tous navigateurs
  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleLogoClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <footer className="relative py-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-background" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 md:gap-8 mb-12">
          {/* Brand */}
          <div>
            <a 
              href="#" 
              onClick={handleLogoClick}
              className="flex items-center gap-3 mb-4 group touch-manipulation"
            >
              <Image
                src="/logo.svg"
                alt="Mick Solutions"
                width={40}
                height={40}
                className="h-10 w-10 opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              />
              <span className="text-lg font-semibold text-white opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                Mick <span className="text-gradient">Solutions</span>
              </span>
            </a>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Automatisation sur-mesure pour PME et indépendants suisses. 
              Gagnez du temps, économisez de l&apos;argent.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <a 
                    href={`#${item.id}`}
                    onClick={(e) => handleNavClick(e, item.id)}
                    className="text-slate-400 hover:text-primary-400 text-sm transition-colors touch-manipulation"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />
                Genève, Suisse
              </li>
              <li>
                <a 
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 text-slate-400 hover:text-primary-400 text-sm transition-colors"
                >
                  <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  {email}
                </a>
              </li>
              {telephone && (
                <li>
                  <a 
                    href={`tel:${telephone.replace(/\s/g, '')}`}
                    className="flex items-center gap-3 text-slate-400 hover:text-primary-400 text-sm transition-colors"
                  >
                    <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                    {telephone}
                  </a>
                </li>
              )}
            </ul>

            {/* Social links */}
            <div className="flex items-center gap-4 mt-6">
              <motion.a
                href={lienLinkedin}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-primary-400 hover:border-primary-500/30 transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © 2025 Mick Solutions. Tous droits réservés.
            </p>
            
            {/* Liens légaux dynamiques */}
            {legalDocs && legalDocs.length > 0 && (
              <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                {legalDocs.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/legal/${doc.Slug}`}
                    className="text-slate-500 hover:text-primary-400 text-sm transition-colors"
                  >
                    {doc.Titre}
                  </Link>
                ))}
              </nav>
            )}
            
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Hébergé en Suisse
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
