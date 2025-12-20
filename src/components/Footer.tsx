'use client';

import { motion } from 'framer-motion';
import { Linkedin, Mail, MapPin } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="relative py-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-background" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 md:gap-8 mb-12">
          {/* Brand */}
          <div>
            <a href="#" className="flex items-center gap-3 mb-4 group">
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
              {['Avantages', 'Services', 'Confiance', 'Contact'].map((item) => (
                <li key={item}>
                  <a 
                    href={`#${item.toLowerCase()}`}
                    className="text-slate-400 hover:text-primary-400 text-sm transition-colors"
                  >
                    {item}
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
                <MapPin className="w-4 h-4 text-primary-400" />
                Genève, Suisse
              </li>
              <li>
                <a 
                  href="mailto:contact@mick-solutions.ch"
                  className="flex items-center gap-3 text-slate-400 hover:text-primary-400 text-sm transition-colors"
                >
                  <Mail className="w-4 h-4 text-primary-400" />
                  contact@mick-solutions.ch
                </a>
              </li>
            </ul>

            {/* Social links */}
            <div className="flex items-center gap-4 mt-6">
              <motion.a
                href="https://linkedin.com"
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

