'use server';

interface ContactResponse {
  success: boolean;
  message: string;
}

export async function submitContact(formData: FormData): Promise<ContactResponse> {
  const nom = formData.get('nom') as string;
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;

  // Validation basique
  if (!nom || !email || !message) {
    return {
      success: false,
      message: 'Tous les champs sont requis.',
    };
  }

  if (!email.includes('@')) {
    return {
      success: false,
      message: 'Adresse email invalide.',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch('https://n8n.mick-solutions.ch/webhook/Contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MickSolutions-ContactForm/1.0',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ nom, email, message }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Log pour debug
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
      message: 'Message envoyé avec succès ! Je vous répondrai rapidement.',
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
