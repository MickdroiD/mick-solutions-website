
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '/home/mickadmin/docker/clients/portfolio-sarah/.env' });

const API_URL = 'https://baserow.mick-solutions.ch/api';
const TOKEN = process.env.BASEROW_API_TOKEN;
const SECTIONS_ID = process.env.BASEROW_FACTORY_SECTIONS_ID || '827';

async function inspect() {
    console.log('🔍 INSPECTING PORTFOLIO-SARAH (Table:', SECTIONS_ID, ')');

    // 1. Check Field Definition
    console.log('\n--- FIELDS ---');
    const fieldsRes = await fetch(`${API_URL}/database/fields/table/${SECTIONS_ID}/`, {
        headers: { Authorization: `Token ${TOKEN}` }
    });
    if (!fieldsRes.ok) console.error('Error fetching fields:', await fieldsRes.text());
    else {
        const fields = await fieldsRes.json();
        const typeField = fields.find((f: any) => f.name === 'Type');
        console.log('Type Field:', typeField ? {
            id: typeField.id,
            type: typeField.type,
            options: typeField.select_options
        } : 'NOT FOUND');
    }

    // 2. Check Rows
    console.log('\n--- ROWS ---');
    const rowsRes = await fetch(`${API_URL}/database/rows/table/${SECTIONS_ID}/?user_field_names=true`, {
        headers: { Authorization: `Token ${TOKEN}` }
    });
    if (!rowsRes.ok) console.error('Error fetching rows:', await rowsRes.text());
    else {
        const data = await rowsRes.json();
        const rows = data.results;
        console.log(`Found ${rows.length} rows.`);
        rows.forEach((r: any) => {
            console.log(`ID: ${r.id} | Nom: ${r.Nom} | Actif: ${r.Actif} | Type:`, r.Type);
        });
    }
}

inspect();
