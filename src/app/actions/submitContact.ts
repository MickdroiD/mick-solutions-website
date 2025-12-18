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
    const response = await fetch('https://n8n.mick-solutions.ch/webhook/Contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nom, email, message }),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    return {
      success: true,
      message: 'Message envoyé avec succès ! Je vous répondrai rapidement.',
    };
  } catch (error) {
    console.error('Erreur lors de l\'envoi du formulaire:', error);
    return {
      success: false,
      message: 'Une erreur est survenue. Veuillez réessayer plus tard.',
    };
  }
}

