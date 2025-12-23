import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import AdvantagesSection from '@/components/AdvantagesSection';
import ServicesSection from '@/components/ServicesSection';
import PortfolioSection from '@/components/PortfolioSection';
import TrustSection from '@/components/TrustSection';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import { 
  getServices, 
  getProjects, 
  getGlobalSettingsComplete, 
  getAllLegalDocs,
  getAdvantages,
  getTrustPoints,
} from '@/lib/baserow';

export default async function Home() {
  // Fetch en parallèle pour optimiser les performances
  const [services, projects, globalSettings, legalDocs, advantages, trustPoints] = await Promise.all([
    getServices(),
    getProjects(),
    getGlobalSettingsComplete(),
    getAllLegalDocs(),
    getAdvantages(),
    getTrustPoints(),
  ]);

  return (
    <main className="relative min-h-screen bg-background">
      <Header globalSettings={globalSettings} />
      <HeroSection globalSettings={globalSettings} />
      <AdvantagesSection advantages={advantages} />
      <ServicesSection services={services ?? []} />
      <PortfolioSection projects={projects ?? []} />
      <TrustSection trustPoints={trustPoints} />
      <ContactForm />
      <Footer globalSettings={globalSettings} legalDocs={legalDocs} />
    </main>
  );
}
