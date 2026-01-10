
import dotenv from 'dotenv';
dotenv.config({ path: '/home/mickadmin/docker/clients/portfolio-sarah/.env' });

const API_URL = 'https://baserow.mick-solutions.ch/api';
const TOKEN = process.env.BASEROW_API_TOKEN;
const SECTIONS_ID = process.env.BASEROW_FACTORY_SECTIONS_ID || '827';

// Option IDs from debug output
const TYPE_IDS = {
    hero: 3483,
    services: 3484,
    advantages: 3485,
    gallery: 3486,
    portfolio: 3487,
    testimonials: 3488,
    trust: 3489,
    faq: 3490,
    contact: 3491,
    blog: 3492,
    'ai-assistant': 3493,
    'infinite-zoom': 3494,
    custom: 3495
};

const SECTIONS_DATA = [
    {
        Nom: "HERO",
        Type: TYPE_IDS.hero,
        Order: "1",
        Actif: true,
        Content: JSON.stringify({
            titreHero: "Hey ! Bienvenue chez Vous 🚀",
            sousTitreHero: "Ceci est bien plus qu'un template. C'est votre nouvelle vitrine magique.",
            badgeHero: "👋 Votre aventure commence ici",
            ctaPrincipal: "Démarrer le projet",
            ctaPrincipalUrl: "#contact",
            ctaSecondaire: "Découvrir mes services",
            ctaSecondaireUrl: "#services",
            trustStat1Value: "100%", "trustStat1Label": "Satisfaction",
            "trustStat2Value": "24/7", "trustStat2Label": "Support Client"
        }),
        Design: JSON.stringify({ style: "electric", min_height: "screen" })
    },
    {
        Nom: "SERVICES",
        Type: TYPE_IDS.services,
        Order: "2",
        Actif: true,
        Content: JSON.stringify({
            titre: "Ce que je déchire 🎸",
            sousTitre: "Voici mes super-pouvoirs. À vous de définir les vôtres !",
            services: [
                { titre: "Expertise Technique", description: "Je transforme le café en code propre.", icone: "Zap" },
                { titre: "Design Immersif", description: "Vos utilisateurs vont adorer.", icone: "Palette" },
                { titre: "Support Réactif", description: "Toujours là pour vous.", icone: "LifeBuoy" }
            ]
        }),
        Design: "{}"
    },
    {
        Nom: "ZOOM",
        Type: TYPE_IDS['infinite-zoom'],
        Order: "3",
        Actif: true,
        Content: JSON.stringify({
            titre: "Exploration Infinie",
            sousTitre: "Plongez dans les détails.",
            instructionText: "Scrollez pour zoomer",
            layers: [
                { id: "l1", imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop", title: "Cosmos", focalPointX: 50, focalPointY: 50 },
                { id: "l2", imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072&auto=format&fit=crop", title: "Orbite", focalPointX: 30, focalPointY: 40 },
                { id: "l3", imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2068&auto=format&fit=crop", title: "Terre", focalPointX: 50, focalPointY: 50 }
            ],
            design: { variant: "contained", transitionDuration: 800, zoomIntensity: 2.5 }
        }),
        Design: "{}"
    },
    {
        Nom: "CONTACT",
        Type: TYPE_IDS.contact,
        Order: "5",
        Actif: true,
        Content: JSON.stringify({
            titre: "On lance le projet ? ☕️",
            sousTitre: "Remplissez ce formulaire.",
            emailContact: "hello@votre-domaine.com"
        }),
        Design: "{}"
    }
];

async function restore() {
    console.log('🔄 RESTORING DATA for Table', SECTIONS_ID);

    // 1. Get existing rows to delete
    const rowsRes = await fetch(`${API_URL}/database/rows/table/${SECTIONS_ID}/?user_field_names=true`, {
        headers: { Authorization: `Token ${TOKEN}` }
    });
    const rowsJson = await rowsRes.json();
    const existingRows = rowsJson.results;

    console.log(`🗑️ Deleting ${existingRows.length} corrupted rows...`);
    for (const row of existingRows) {
        await fetch(`${API_URL}/database/rows/table/${SECTIONS_ID}/${row.id}/`, {
            method: 'DELETE',
            headers: { Authorization: `Token ${TOKEN}` }
        });
    }

    // 2. Insert new rows
    console.log(`🌱 Seeding ${SECTIONS_DATA.length} fresh rows...`);
    for (const data of SECTIONS_DATA) {
        const res = await fetch(`${API_URL}/database/rows/table/${SECTIONS_ID}/?user_field_names=true`, {
            method: 'POST',
            headers: {
                Authorization: `Token ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            console.error('Failed to create row:', await res.text());
        } else {
            const json = await res.json();
            console.log(`✅ Created row ${json.id} (${data.Nom})`);
        }
    }
}

restore();
