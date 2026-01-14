
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectData() {
    try {
        console.log("🔍 Inspecting CUSTOM Section Blocks...");
        const customs = await prisma.section.findMany({
            where: { type: 'CUSTOM' }
        });

        let foundZoom = false;

        customs.forEach(s => {
            const blocks = s.content?.blocks || [];
            const zoomBlocks = blocks.filter(b => b.type === 'infinite-zoom');

            if (zoomBlocks.length > 0) {
                foundZoom = true;
                console.log(`\n🆔 Section ID: ${s.id} (CUSTOM) contains ${zoomBlocks.length} Infinite Zoom block(s)`);
                zoomBlocks.forEach((b, idx) => {
                    console.log(`\n   📦 Block #${idx} Structure:`);
                    console.log(JSON.stringify(b, null, 2));
                });
            }
        });

        if (!foundZoom) {
            console.log("⚠️ Aucun bloc 'infinite-zoom' trouvé dans les sections CUSTOM.");
        }

    } catch (e) {
        console.error("❌ Erreur:", e);
    } finally {
        await prisma.$disconnect();
    }
}

inspectData();
