'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, ChevronRight, Linkedin, Instagram, Twitter, Youtube } from 'lucide-react';
import Image from 'next/image';
import type { FooterModuleProps } from '../types';

/**
 * FooterMega - Variante XXL avec beaucoup d'informations.
 * 
 * @description Footer complet avec newsletter, horaires, carte,
 * FAQ rapide, réseaux sociaux. Idéal pour e-commerce, sites de services.
 */
export function FooterMega({ config, legalDocs = [] }: FooterModuleProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Intégrer avec n8n webhook
    if (config.n8nWebhookNewsletter) {
      try {
        await fetch(config.n8nWebhookNewsletter, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
      } catch (err) {
        console.error('Newsletter subscription error:', err);
      }
    }
    setSubscribed(true);
    setEmail('');
  };

  const navSections = [
    {
      title: 'Navigation',
      links: [
        { name: 'Avantages', href: '#avantages' },
        { name: 'Services', href: '#services' },
        { name: 'Portfolio', href: '#portfolio' },
        { name: 'Contact', href: '#contact' },
      ],
    },
    {
      title: 'Services',
      links: [
        { name: 'Automatisation', href: '#services' },
        { name: 'Sites Web', href: '#services' },
        { name: 'Support', href: '#services' },
        { name: 'Consulting', href: '#services' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Linkedin, url: config.lienLinkedin, label: 'LinkedIn', color: '#0077B5' },
    { icon: Instagram, url: config.lienInstagram, label: 'Instagram', color: '#E4405F' },
    { icon: Twitter, url: config.lienTwitter, label: 'Twitter', color: '#1DA1F2' },
    { icon: Youtube, url: config.lienYoutube, label: 'YouTube', color: '#FF0000' },
  ].filter(s => s.url);

  return (
    <footer className="bg-gradient-to-b from-primary-50 to-white dark:from-primary-950 dark:to-background">
      {/* Newsletter section */}
      <div className="border-b border-primary-200 dark:border-primary-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h3 className="text-3xl font-bold text-primary-900 dark:text-foreground mb-4">
                Restez informé
              </h3>
              <p className="text-primary-600 dark:text-primary-400">
                Recevez nos dernières actualités, conseils et offres directement dans votre boîte mail.
              </p>
            </div>
            
            <form onSubmit={handleNewsletterSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre email"
                  required
                  disabled={subscribed}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-primary-200 dark:border-primary-700
                           bg-white dark:bg-primary-900 text-primary-900 dark:text-foreground
                           placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500
                           disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={subscribed}
                className="btn-primary whitespace-nowrap"
              >
                {subscribed ? 'Inscrit !' : 'S\'inscrire'}
                {!subscribed && <Send className="w-4 h-4 ml-2" />}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* About column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="flex items-center gap-3 mb-6">
              {config.logoUrl && (
                <Image
                  src={config.logoUrl}
                  alt={config.nomSite}
                  width={48}
                  height={48}
                  className="w-12 h-12"
                />
              )}
              <div>
                <p className="font-bold text-xl text-primary-900 dark:text-foreground">
                  {config.nomSite}
                </p>
                <p className="text-xs text-primary-500">{config.slogan.substring(0, 50)}</p>
              </div>
            </div>
            
            {/* Contact info cards */}
            <div className="space-y-3 mb-6">
              <a href={`mailto:${config.email}`} className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-primary-900 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary-500" />
                </div>
                <span className="text-sm text-primary-700 dark:text-primary-300">{config.email}</span>
              </a>
              
              {config.telephone && (
                <a href={`tel:${config.telephone}`} className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-primary-900 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary-500" />
                  </div>
                  <span className="text-sm text-primary-700 dark:text-primary-300">{config.telephone}</span>
                </a>
              )}
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-primary-900 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary-500" />
                </div>
                <span className="text-sm text-primary-700 dark:text-primary-300">{config.adresse}</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl flex items-center justify-center
                           bg-white dark:bg-primary-900 shadow-sm
                           text-primary-600 dark:text-primary-400
                           hover:text-white transition-all duration-300"
                  style={{ '--hover-bg': social.color } as React.CSSProperties}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = social.color}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Navigation columns */}
          {navSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <h4 className="font-semibold text-primary-900 dark:text-foreground mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="group flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Legal column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-semibold text-primary-900 dark:text-foreground mb-4">
              Informations légales
            </h4>
            <ul className="space-y-3">
              {legalDocs.filter(d => d.isActive).map((doc) => (
                <li key={doc.id}>
                  <a
                    href={`/legal/${doc.slug}`}
                    className="group flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {doc.titre}
                  </a>
                </li>
              ))}
            </ul>
            
            {/* Trust badge */}
            <div className="mt-6 p-4 rounded-xl bg-primary-100/50 dark:bg-primary-900/50 border border-primary-200 dark:border-primary-800">
              <p className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {config.paysHebergement}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-primary-200 dark:border-primary-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-500">
            © {currentYear} {config.nomSite}. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            {config.showLegalLinks && legalDocs.filter(d => d.isActive).slice(0, 3).map((doc) => (
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
      </div>
    </footer>
  );
}

