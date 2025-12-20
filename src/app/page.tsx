import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import AdvantagesSection from '@/components/AdvantagesSection';
import ServicesSection from '@/components/ServicesSection';
import TrustSection from '@/components/TrustSection';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';

// Fetch services from Baserow
async function getServices() {
  console.log('========================================');
  console.log('🔄 TENTATIVE DE CONNEXION BASEROW');
  console.log('========================================');
  
  try {
    const token = process.env.BASEROW_TOKEN;
    const tableId = process.env.BASEROW_SERVICES_TABLE_ID || '748';
    
    // Debug: Afficher les variables d'environnement (token masqué)
    console.log('📋 Variables d\'environnement:');
    console.log(`   - BASEROW_TOKEN: ${token ? `${token.substring(0, 4)}****${token.substring(token.length - 4)}` : '❌ NON DÉFINI'}`);
    console.log(`   - Table ID: ${tableId}`);
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   - VERCEL_ENV: ${process.env.VERCEL_ENV || 'local'}`);
    
    if (!token) {
      console.error('❌ ERREUR: BASEROW_TOKEN non défini - Utilisation des Mock Data');
      return null;
    }

    const apiUrl = `https://baserow.mick-solutions.ch/api/database/rows/table/${tableId}/?user_field_names=true`;
    console.log(`🌐 URL de l'API: ${apiUrl}`);
    console.log('⏳ Envoi de la requête...');

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'User-Agent': 'MickSolutions-Website/1.0 (Vercel; Next.js)',
        'Accept': 'application/json',
        'Accept-Language': 'fr-CH,fr;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    console.log(`📡 Réponse reçue - Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ERREUR BASEROW:');
      console.error(`   - Status Code: ${response.status}`);
      console.error(`   - Status Text: ${response.statusText}`);
      console.error(`   - Response Body: ${errorText}`);
      console.error(`   - Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
      return null;
    }

    const data = await response.json();
    console.log(`✅ Données récupérées avec succès!`);
    console.log(`   - Nombre de services: ${data.results?.length || 0}`);
    console.log('========================================');
    
    return data.results;
  } catch (error) {
    console.error('========================================');
    console.error('❌ EXCEPTION LORS DU FETCH BASEROW:');
    console.error(`   - Type: ${error instanceof Error ? error.name : typeof error}`);
    console.error(`   - Message: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof Error && error.stack) {
      console.error(`   - Stack: ${error.stack}`);
    }
    console.error('========================================');
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
