import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import AdvantagesSection from '@/components/AdvantagesSection';
import ServicesSection from '@/components/ServicesSection';
import PortfolioSection from '@/components/PortfolioSection';
import TrustSection from '@/components/TrustSection';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import { getServices, getProjects, getGlobalSettings, getAllLegalDocs } from '@/lib/baserow';

export default async function Home() {
  // Fetch en parallèle pour optimiser les performances
  const [services, projects, globalSettings, legalDocs] = await Promise.all([
    getServices(),
    getProjects(),
    getGlobalSettings(),
    getAllLegalDocs(),
  ]);

  return (
    <main className="relative min-h-screen bg-background">
      <Header globalSettings={globalSettings} />
      <HeroSection globalSettings={globalSettings} />
      <AdvantagesSection />
      <ServicesSection services={services ?? []} />
      <PortfolioSection projects={projects ?? []} />
      <TrustSection />
      <ContactForm />
      <Footer globalSettings={globalSettings} legalDocs={legalDocs} />
    </main>
  );
}
