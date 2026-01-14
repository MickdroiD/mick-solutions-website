// ============================================
// SECTION TEMPLATES LIBRARY - Factory V5
// Pre-built section configurations
// ============================================

import { UniversalSectionConfig } from '../types-universal';

export interface SectionTemplate {
    id: string;
    name: string;
    description: string;
    category: 'hero' | 'features' | 'testimonials' | 'pricing' | 'cta' | 'contact' | 'about' | 'portfolio';
    thumbnail?: string;
    // Using any[] since templates contain partial block definitions that get completed at runtime
    blocks: any[];
    config?: Partial<UniversalSectionConfig>;
}

// Generate unique IDs for blocks
const generateId = () => Math.random().toString(36).substr(2, 9);

export const SECTION_TEMPLATES: SectionTemplate[] = [
    // =====================
    // HERO TEMPLATES
    // =====================
    {
        id: 'hero-centered',
        name: 'Hero Centré',
        description: 'Hero classique avec titre, sous-titre et CTA centré',
        category: 'hero',
        blocks: [
            { type: 'heading', content: { text: 'Bienvenue sur notre site' }, style: { fontSize: '3.5rem', gradient: true, gradientFrom: '#22d3ee', gradientTo: '#a855f7' } },
            { type: 'text', content: { text: 'Découvrez nos solutions innovantes pour transformer votre entreprise.' }, style: { fontSize: '1.25rem', color: '#9ca3af' } },
            { type: 'spacer', style: { height: '2rem' } },
            { type: 'button', content: { text: 'Commencer', url: '#contact' }, style: { variant: 'gradient' } },
        ],
    },
    {
        id: 'hero-split',
        name: 'Hero Split',
        description: 'Hero avec image à droite',
        category: 'hero',
        blocks: [
            { type: 'heading', content: { text: 'Transformez votre business' }, style: { fontSize: '3rem', gradient: true } },
            { type: 'text', content: { text: 'Une solution tout-en-un pour votre croissance digitale.' }, style: { color: '#d1d5db' } },
            { type: 'button', content: { text: 'Découvrir', url: '#' }, style: { variant: 'gradient' } },
        ],
    },
    {
        id: 'hero-video',
        name: 'Hero avec Vidéo',
        description: 'Hero avec fond vidéo',
        category: 'hero',
        blocks: [
            { type: 'heading', content: { text: 'L\'excellence en action' }, style: { fontSize: '4rem', color: '#ffffff' } },
            { type: 'text', content: { text: 'Regardez ce que nous pouvons accomplir ensemble.' } },
            { type: 'button', content: { text: 'En savoir plus' }, style: { variant: 'outline' } },
        ],
    },

    // =====================
    // FEATURES TEMPLATES
    // =====================
    {
        id: 'features-grid',
        name: 'Features Grid',
        description: 'Grille de fonctionnalités avec icônes',
        category: 'features',
        blocks: [
            { type: 'heading', content: { text: 'Nos Fonctionnalités' }, style: { fontSize: '2.5rem' } },
            { type: 'text', content: { text: 'Tout ce dont vous avez besoin pour réussir.' }, style: { color: '#9ca3af' } },
            { type: 'spacer', style: { height: '2rem' } },
            {
                type: 'feature-grid', content: {
                    title: '', features: [
                        { id: 'f1', icon: 'Zap', title: 'Rapide', description: 'Performance optimisée pour une expérience fluide' },
                        { id: 'f2', icon: 'Shield', title: 'Sécurisé', description: 'Protection de vos données garantie' },
                        { id: 'f3', icon: 'Palette', title: 'Personnalisable', description: '100% configurable selon vos besoins' },
                        { id: 'f4', icon: 'Globe', title: 'Mondial', description: 'Accessible partout dans le monde' },
                        { id: 'f5', icon: 'Clock', title: '24/7', description: 'Support disponible à tout moment' },
                        { id: 'f6', icon: 'TrendingUp', title: 'Croissance', description: 'Outils pour booster votre business' },
                    ]
                }, style: { variant: 'cards', columns: 3 }
            },
        ],
    },
    {
        id: 'features-bento',
        name: 'Bento Features',
        description: 'Grille Bento style Apple',
        category: 'features',
        blocks: [
            { type: 'heading', content: { text: 'Pourquoi nous choisir' }, style: { fontSize: '2.5rem' } },
            { type: 'spacer', style: { height: '1.5rem' } },
            {
                type: 'bento-grid', content: {
                    items: [
                        { id: 'b1', title: 'Innovation', description: 'Technologies de pointe', icon: 'Lightbulb', span: 'lg' },
                        { id: 'b2', title: 'Design', icon: 'Wand2', span: 'sm' },
                        { id: 'b3', title: 'Performance', icon: 'Gauge', span: 'md' },
                        { id: 'b4', title: 'Fiabilité', description: '99.9% uptime', icon: 'Server', span: 'sm' },
                    ]
                }, style: { gap: 'md', showHoverEffect: true }
            },
        ],
    },

    // =====================
    // TESTIMONIALS TEMPLATES
    // =====================
    {
        id: 'testimonials-grid',
        name: 'Témoignages Grid',
        description: 'Grille de témoignages clients',
        category: 'testimonials',
        blocks: [
            { type: 'heading', content: { text: 'Ce que disent nos clients' }, style: { fontSize: '2.5rem' } },
            { type: 'spacer', style: { height: '2rem' } },
            { type: 'testimonial', content: { quote: 'Service exceptionnel, je recommande vivement !', author: 'Marie Dupont', role: 'CEO', company: 'TechCorp', rating: 5 }, style: { variant: 'card' } },
        ],
    },
    {
        id: 'testimonials-marquee',
        name: 'Logos + Témoignages',
        description: 'Logo cloud avec témoignage',
        category: 'testimonials',
        blocks: [
            {
                type: 'logo-cloud', content: {
                    logos: [
                        { id: 'l1', url: 'https://placehold.co/150x60/1a1a2e/ffffff?text=Client+1' },
                        { id: 'l2', url: 'https://placehold.co/150x60/1a1a2e/ffffff?text=Client+2' },
                        { id: 'l3', url: 'https://placehold.co/150x60/1a1a2e/ffffff?text=Client+3' },
                    ]
                }, style: { grayscale: true }
            },
            { type: 'spacer', style: { height: '2rem' } },
            { type: 'testimonial', content: { quote: 'Partenaire idéal pour notre transformation digitale.', author: 'Jean Martin', role: 'CTO', company: 'InnovateTech', rating: 5 }, style: { variant: 'quote' } },
        ],
    },

    // =====================
    // PRICING TEMPLATES
    // =====================
    {
        id: 'pricing-3cols',
        name: 'Pricing 3 Colonnes',
        description: 'Tableau de prix classique',
        category: 'pricing',
        blocks: [
            { type: 'heading', content: { text: 'Nos Offres' }, style: { fontSize: '2.5rem' } },
            { type: 'text', content: { text: 'Choisissez le plan adapté à vos besoins' }, style: { color: '#9ca3af' } },
            { type: 'spacer', style: { height: '2rem' } },
            {
                type: 'pricing', content: {
                    plans: [
                        { id: 'p1', name: 'Starter', price: '29€', period: 'mois', features: ['5 projets', 'Support email', 'Mises à jour'], ctaText: 'Choisir' },
                        { id: 'p2', name: 'Pro', price: '79€', period: 'mois', features: ['Projets illimités', 'Support prioritaire', 'API access', 'Analytics'], highlighted: true, ctaText: 'Commencer' },
                        { id: 'p3', name: 'Enterprise', price: 'Sur mesure', period: '', features: ['Tout Pro', 'SLA personnalisé', 'Account manager', 'Formation'], ctaText: 'Contacter' },
                    ]
                }, style: { variant: 'cards', columns: 3, highlightColor: '#a855f7' }
            },
        ],
    },

    // =====================
    // CTA TEMPLATES
    // =====================
    {
        id: 'cta-gradient',
        name: 'CTA Gradient',
        description: 'Call-to-action avec fond gradient',
        category: 'cta',
        blocks: [
            {
                type: 'cta-section', content: {
                    headline: 'Prêt à transformer votre business ?',
                    subheadline: 'Rejoignez des milliers d\'entreprises qui nous font confiance.',
                    primaryButtonText: 'Démarrer maintenant',
                    primaryButtonUrl: '#contact',
                    secondaryButtonText: 'En savoir plus'
                }, style: { variant: 'centered', gradientFrom: '#a855f7', gradientTo: '#ec4899' }
            },
        ],
    },
    {
        id: 'cta-countdown',
        name: 'CTA avec Countdown',
        description: 'Offre limitée avec compte à rebours',
        category: 'cta',
        blocks: [
            { type: 'heading', content: { text: 'Offre Spéciale' }, style: { fontSize: '2rem', gradient: true } },
            { type: 'countdown', content: { targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), title: 'Se termine dans' }, style: { variant: 'boxes', accentColor: '#ec4899' } },
            { type: 'spacer', style: { height: '1.5rem' } },
            { type: 'button', content: { text: 'Profiter de l\'offre', url: '#' }, style: { variant: 'gradient' } },
        ],
    },

    // =====================
    // CONTACT TEMPLATES
    // =====================
    {
        id: 'contact-form',
        name: 'Formulaire Contact',
        description: 'Section contact avec formulaire',
        category: 'contact',
        blocks: [
            { type: 'heading', content: { text: 'Contactez-nous' }, style: { fontSize: '2.5rem' } },
            { type: 'text', content: { text: 'Nous sommes là pour répondre à vos questions.' }, style: { color: '#9ca3af' } },
            { type: 'spacer', style: { height: '2rem' } },
            {
                type: 'form', content: {
                    fields: [
                        { id: 'name', type: 'text', label: 'Nom', required: true },
                        { id: 'email', type: 'email', label: 'Email', required: true },
                        { id: 'message', type: 'textarea', label: 'Message', required: true }
                    ],
                    submitText: 'Envoyer'
                }, style: { variant: 'bordered' }
            },
        ],
    },
    {
        id: 'contact-newsletter',
        name: 'Newsletter Simple',
        description: 'Inscription newsletter',
        category: 'contact',
        blocks: [
            {
                type: 'newsletter', content: {
                    title: 'Restez informé',
                    subtitle: 'Recevez nos dernières actualités et offres exclusives.',
                    buttonText: 'S\'inscrire'
                }, style: { variant: 'stacked', accentColor: '#22d3ee' }
            },
        ],
    },

    // =====================
    // ABOUT TEMPLATES
    // =====================
    {
        id: 'about-team',
        name: 'Notre Équipe',
        description: 'Présentation de l\'équipe',
        category: 'about',
        blocks: [
            { type: 'heading', content: { text: 'Notre Équipe' }, style: { fontSize: '2.5rem' } },
            { type: 'text', content: { text: 'Des experts passionnés à votre service.' }, style: { color: '#9ca3af' } },
            { type: 'spacer', style: { height: '2rem' } },
            {
                type: 'team', content: {
                    members: [
                        { id: 'm1', name: 'Sophie Martin', role: 'CEO & Fondatrice' },
                        { id: 'm2', name: 'Thomas Dubois', role: 'CTO' },
                        { id: 'm3', name: 'Léa Bernard', role: 'Lead Designer' },
                    ]
                }, style: { variant: 'cards', columns: 3, imageShape: 'circle' }
            },
        ],
    },
    {
        id: 'about-timeline',
        name: 'Notre Histoire',
        description: 'Timeline de l\'entreprise',
        category: 'about',
        blocks: [
            { type: 'heading', content: { text: 'Notre Parcours' }, style: { fontSize: '2.5rem' } },
            { type: 'spacer', style: { height: '2rem' } },
            {
                type: 'timeline', content: {
                    items: [
                        { id: 't1', date: '2018', title: 'Fondation', description: 'Création de l\'entreprise' },
                        { id: 't2', date: '2020', title: 'Croissance', description: 'Premier million d\'utilisateurs' },
                        { id: 't3', date: '2022', title: 'Expansion', description: 'Ouverture internationale' },
                        { id: 't4', date: '2024', title: 'Innovation', description: 'Lancement de la V5' },
                    ]
                }, style: { variant: 'alternating', dotColor: '#22d3ee' }
            },
        ],
    },
    {
        id: 'about-stats',
        name: 'Chiffres Clés',
        description: 'Statistiques de l\'entreprise',
        category: 'about',
        blocks: [
            { type: 'heading', content: { text: 'En Chiffres' }, style: { fontSize: '2.5rem' } },
            { type: 'spacer', style: { height: '2rem' } },
            {
                type: 'stats-counter', content: {
                    stats: [
                        { id: 's1', value: 10000, suffix: '+', label: 'Clients' },
                        { id: 's2', value: 50, suffix: '+', label: 'Pays' },
                        { id: 's3', value: 99, suffix: '%', label: 'Satisfaction' },
                        { id: 's4', value: 24, suffix: '/7', label: 'Support' },
                    ]
                }, style: { variant: 'grid', columns: 4, animate: true, valueColor: '#22d3ee' }
            },
        ],
    },

    // =====================
    // PORTFOLIO TEMPLATES
    // =====================
    {
        id: 'portfolio-gallery',
        name: 'Galerie Projets',
        description: 'Showcase de projets',
        category: 'portfolio',
        blocks: [
            { type: 'heading', content: { text: 'Nos Réalisations' }, style: { fontSize: '2.5rem' } },
            { type: 'text', content: { text: 'Découvrez nos derniers projets.' }, style: { color: '#9ca3af' } },
            { type: 'spacer', style: { height: '2rem' } },
            {
                type: 'gallery', content: {
                    images: [
                        { id: 'g1', url: 'https://placehold.co/600x400/1a1a2e/22d3ee?text=Projet+1' },
                        { id: 'g2', url: 'https://placehold.co/600x400/1a1a2e/a855f7?text=Projet+2' },
                        { id: 'g3', url: 'https://placehold.co/600x400/1a1a2e/ec4899?text=Projet+3' },
                        { id: 'g4', url: 'https://placehold.co/600x400/1a1a2e/22d3ee?text=Projet+4' },
                    ]
                }, style: { columns: 2, gap: 'md', hoverEffect: 'zoom' }
            },
        ],
    },
    {
        id: 'portfolio-before-after',
        name: 'Avant/Après',
        description: 'Comparaison de projets',
        category: 'portfolio',
        blocks: [
            { type: 'heading', content: { text: 'Notre Impact' }, style: { fontSize: '2.5rem' } },
            { type: 'text', content: { text: 'Voyez la différence.' }, style: { color: '#9ca3af' } },
            { type: 'spacer', style: { height: '2rem' } },
            {
                type: 'before-after', content: {
                    beforeImage: 'https://placehold.co/800x500/1a1a2e/666666?text=AVANT',
                    afterImage: 'https://placehold.co/800x500/22d3ee/000000?text=APRÈS',
                    beforeLabel: 'Avant',
                    afterLabel: 'Après'
                }, style: { variant: 'slider' }
            },
        ],
    },
];

// Group templates by category
export const getTemplatesByCategory = () => {
    const categories: Record<string, SectionTemplate[]> = {};

    SECTION_TEMPLATES.forEach(template => {
        if (!categories[template.category]) {
            categories[template.category] = [];
        }
        categories[template.category].push(template);
    });

    return categories;
};

// Get category labels
export const CATEGORY_LABELS: Record<string, string> = {
    hero: '🚀 Hero',
    features: '⭐ Features',
    testimonials: '💬 Témoignages',
    pricing: '💳 Pricing',
    cta: '📢 Call-to-Action',
    contact: '📧 Contact',
    about: '👥 À Propos',
    portfolio: '🎨 Portfolio',
};
