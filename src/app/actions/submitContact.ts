'use server';

interface ContactResponse {
  success: boolean;
  message: string;
}

export async function submitContact(formData: FormData): Promise<ContactResponse> {
  const nom = formData.get('nom') as string;
  const entreprise = formData.get('entreprise') as string || '';
  const email = formData.get('email') as string;
  const voleurTemps = formData.get('voleurTemps') as string;
  const message = formData.get('message') as string;

  // Validation
  if (!nom || !email || !message || !voleurTemps) {
    return {
      success: false,
      message: 'Veuillez remplir tous les champs obligatoires.',
    };
  }

  if (!email.includes('@') || !email.includes('.')) {
    return {
      success: false,
      message: 'Adresse email invalide.',
    };
  }

  // Map voleurTemps to readable text
  const voleurTempsMap: Record<string, string> = {
    emails: 'Gestion des emails',
    facturation: 'Facturation & comptabilité',
    saisie: 'Saisie de données',
    planification: 'Planification & RDV',
    autre: 'Autre',
  };

  const voleurTempsReadable = voleurTempsMap[voleurTemps] || voleurTemps;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://n8n.mick-solutions.ch/webhook/Contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MickSolutions-ContactForm/2.0',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        nom,
        entreprise,
        email,
        voleurTemps: voleurTempsReadable,
        message,
        source: 'Site Web - Nouveau Design',
        date: new Date().toISOString(),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    console.log('n8n response status:', response.status);
    console.log('n8n response body:', responseText);

    if (!response.ok) {
      console.error('n8n error:', response.status, responseText);
      return {
        success: false,
        message: `Erreur serveur (${response.status}). Réessayez plus tard.`,
      };
    }

    return {
      success: true,
      message: 'Merci ! Votre demande a été envoyée. Nous vous répondrons sous 24h.',
    };
  } catch (error) {
    console.error('Erreur lors de l\'envoi du formulaire:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          message: 'Délai d\'attente dépassé. Vérifiez votre connexion.',
        };
      }
      return {
        success: false,
        message: `Erreur: ${error.message}`,
      };
    }
    
    return {
      success: false,
      message: 'Une erreur est survenue. Veuillez réessayer plus tard.',
    };
  }
}
