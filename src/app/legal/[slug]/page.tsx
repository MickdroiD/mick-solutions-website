import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Calendar, Shield } from 'lucide-react';
import { getAllLegalDocs, getLegalDocBySlug, getGlobalSettingsComplete } from '@/lib/baserow';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Génération statique des pages au build (SSG)
export async function generateStaticParams() {
  const docs = await getAllLegalDocs();
  
  if (!docs) return [];
  
  return docs.map((doc) => ({
    slug: doc.Slug,
  }));
}

// Métadonnées dynamiques pour le SEO (White Label)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [doc, settings] = await Promise.all([
    getLegalDocBySlug(slug),
    getGlobalSettingsComplete(),
  ]);
  
  if (!doc) {
    return {
      title: 'Document non trouvé',
    };
  }
  
  return {
    title: doc.Titre,
    description: `${doc.Titre} - ${settings.nomSite}. Consultez nos informations légales.`,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LegalPage({ params }: PageProps) {
  const { slug } = await params;
  const [doc, settings] = await Promise.all([
    getLegalDocBySlug(slug),
    getGlobalSettingsComplete(),
  ]);
  
  if (!doc) {
    notFound();
  }

  // Formater la date si disponible
  const formattedDate = doc.DateMiseAJour
    ? new Intl.DateTimeFormat('fr-CH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(doc.DateMiseAJour))
    : null;

  return (
    <main className="min-h-screen bg-background">
      {/* Header avec navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-primary-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Retour à l&apos;accueil</span>
          </Link>
        </div>
      </header>

      {/* Contenu principal */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* En-tête du document */}
        <header className="mb-12 pb-8 border-b border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary-500/10 border border-primary-500/20">
              <Shield className="w-5 h-5 text-primary-400" />
            </div>
            <span className="text-sm text-slate-400 uppercase tracking-wider font-medium">
              Document légal
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {doc.Titre}
          </h1>
          
          {formattedDate && (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Dernière mise à jour : {formattedDate}</span>
            </div>
          )}
        </header>

        {/* Contenu Markdown */}
        <div className="legal-content prose prose-invert prose-lg max-w-none">
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="text-2xl font-bold text-white mt-12 mb-4 pb-2 border-b border-white/10">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold text-white mt-8 mb-3">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-slate-300 leading-relaxed mb-4">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-2 text-slate-300 mb-4 ml-4">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-2 text-slate-300 mb-4 ml-4">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-slate-300">
                  {children}
                </li>
              ),
              strong: ({ children }) => (
                <strong className="text-white font-semibold">
                  {children}
                </strong>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-primary-400 hover:text-primary-300 underline underline-offset-4 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary-500/50 pl-4 italic text-slate-400 my-6">
                  {children}
                </blockquote>
              ),
            }}
          >
            {doc.Contenu}
          </ReactMarkdown>
        </div>

        {/* Footer du document */}
        <footer className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} {settings.nomSite}. Tous droits réservés.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l&apos;accueil
            </Link>
          </div>
        </footer>
      </article>
    </main>
  );
}

