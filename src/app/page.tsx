import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import AdvantagesSection from '@/components/AdvantagesSection';
import ServicesSection from '@/components/ServicesSection';
import TrustSection from '@/components/TrustSection';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';

// Fetch services from Baserow
async function getServices() {
  try {
    const token = process.env.BASEROW_TOKEN;
    if (!token) {
      console.warn('BASEROW_TOKEN not set, using default services');
      return null;
    }

    const response = await fetch(
      'https://baserow.mick-solutions.ch/api/database/rows/table/748/?user_field_names=true',
      {
        headers: {
          Authorization: `Token ${token}`,
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      console.error('Baserow fetch error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching services:', error);
    return null;
  }
}

export default async function Home() {
  const services = await getServices();

  return (
    <main className="relative min-h-screen bg-background">
      <Header />
      <HeroSection />
      <AdvantagesSection />
      <ServicesSection services={services} />
      <TrustSection />
      <ContactForm />
      <Footer />
    </main>
  );
}
