
import dotenv from 'dotenv';
import path from 'path';

// Load portfolio-sarah env
dotenv.config({ path: '/home/mickadmin/docker/clients/portfolio-sarah/.env' });

async function debugData() {
    console.log('🔍 DEBUG CLIENT DATA');
    console.log('Token:', process.env.BASEROW_API_TOKEN?.substring(0, 10) + '...');
    console.log('Table ID:', process.env.TABLE_ID_SECTIONS);
    console.log('API URL:', process.env.BASEROW_API_URL || 'https://baserow.mick-solutions.ch/api');

    const BASEROW_API_URL = process.env.BASEROW_API_URL || 'https://baserow.mick-solutions.ch/api';

    try {
        // 1. Check Field Definition
        console.log('\n📋 CHECKING FIELD DEFINITION...');
        const fieldsRes = await fetch(`${BASEROW_API_URL}/database/fields/table/${process.env.TABLE_ID_SECTIONS}/`, {
            headers: { Authorization: `Token ${process.env.BASEROW_API_TOKEN}` }
        });
        const fields = await fieldsRes.json();
        const typeField = fields.find((f: any) => f.name === 'Type');
        console.log('Type Field:', typeField ? { id: typeField.id, type: typeField.type } : 'NOT FOUND');

        // 2. Check Rows
        console.log('\n📦 CHECKING ROWS...');
        const rowsRes = await fetch(`${BASEROW_API_URL}/database/rows/table/${process.env.TABLE_ID_SECTIONS}/?user_field_names=true`, {
            headers: { Authorization: `Token ${process.env.BASEROW_API_TOKEN}` }
        });
        const rows = await rowsRes.json();

        console.log(`Found ${rows.count} rows.`);
        rows.results.forEach((r: any) => {
            console.log(`- [${r.id}] ${r.Nom} | Type: ${JSON.stringify(r.Type)}`);
        });

    } catch (e) {
        console.error('❌ ERROR:', e);
    }
}

debugData();
