
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectData() {
    try {
        console.log("🔍 Inspecting Sections...");
        const sections = await prisma.section.findMany({
            where: {
                type: 'INFINITE_ZOOM'
            }
        });

        if (sections.length === 0) {
            console.log("⚠️ Aucune section INFINITE_ZOOM trouvée en base.");
            // On cherche aussi les sections CUSTOM pour voir si elles sont mal typées
            const customs = await prisma.section.findMany({
                where: { type: 'CUSTOM' },
                take: 3
            });
            console.log("--- Sections CUSTOM récentes (pour vérif) ---");
            customs.forEach(s => console.log(`ID: ${s.id}, Name: ${s.name}, Content Keys:`, Object.keys(s.content || {})));
        } else {
            console.log(`✅ ${sections.length} sections INFINITE_ZOOM trouvées.`);
            sections.forEach(s => {
                console.log(`\n🆔 Section ID: ${s.id}`);
                console.log("📂 Content Structure:", JSON.stringify(s.content, null, 2));
            });
        }
    } catch (e) {
        console.error("❌ Erreur:", e);
    } finally {
        await prisma.$disconnect();
    }
}

inspectData();
