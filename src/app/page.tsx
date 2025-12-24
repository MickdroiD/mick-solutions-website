import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import AdvantagesSection from '@/components/AdvantagesSection';
import ServicesSection from '@/components/ServicesSection';
import GallerySection from '@/components/GallerySection';
import PortfolioSection from '@/components/PortfolioSection';
import TrustSection from '@/components/TrustSection';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import AnimationWrapper from '@/components/AnimationWrapper';
import { 
  getServices, 
  getProjects, 
  getGlobalSettingsComplete, 
  getAllLegalDocs,
  getAdvantages,
  getTrustPoints,
  getGalleryItems,
} from '@/lib/baserow';

// Force le rendu dynamique (SSR) pour le mode multi-tenant
// Les données sont récupérées au runtime, pas au build time
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch en parallèle pour optimiser les performances
  const [services, projects, globalSettings, legalDocs, advantages, trustPoints, galleryItems] = await Promise.all([
    getServices(),
    getProjects(),
    getGlobalSettingsComplete(),
    getAllLegalDocs(),
    getAdvantages(),
    getTrustPoints(),
    getGalleryItems(),
  ]);

  // Récupérer le style d'animation depuis les settings
  const animationStyle = globalSettings.animationStyle;

  return (
    <main className="relative min-h-screen bg-background">
      <Header globalSettings={globalSettings} />
      
      {/* Hero Section - Animation avec délai 0 */}
      <HeroSection globalSettings={globalSettings} />
      
      {/* Advantages Section */}
      <AnimationWrapper animationStyle={animationStyle} delay={0.1}>
        <AdvantagesSection advantages={advantages} />
      </AnimationWrapper>
      
      {/* Services Section */}
      <AnimationWrapper animationStyle={animationStyle} delay={0.1}>
        <ServicesSection services={services ?? []} />
      </AnimationWrapper>

      {/* Gallery Section - S'affiche uniquement s'il y a des images */}
      {galleryItems.length > 0 && (
        <AnimationWrapper animationStyle={animationStyle} delay={0.1}>
          <GallerySection galleryItems={galleryItems} />
        </AnimationWrapper>
      )}
      
      {/* Portfolio Section */}
      <AnimationWrapper animationStyle={animationStyle} delay={0.1}>
        <PortfolioSection projects={projects ?? []} />
      </AnimationWrapper>
      
      {/* Trust Section */}
      <AnimationWrapper animationStyle={animationStyle} delay={0.1}>
        <TrustSection trustPoints={trustPoints} />
      </AnimationWrapper>
      
      {/* Contact Form */}
      <AnimationWrapper animationStyle={animationStyle} delay={0.1}>
        <ContactForm />
      </AnimationWrapper>
      
      <Footer globalSettings={globalSettings} legalDocs={legalDocs} />
    </main>
  );
}
