
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '/home/mickadmin/docker/clients/portfolio-sarah/.env' });

const API_URL = 'https://baserow.mick-solutions.ch/api';
const TABLE_ID = process.env.BASEROW_FACTORY_SECTIONS_ID || '827';
const ADMIN_EMAIL = 'contact@mick-solutions.ch';
const ADMIN_PASS = 'BSRWdroid46!';

const SECTION_OPTIONS = [
    { value: 'hero', color: 'blue' },
    { value: 'services', color: 'green' },
    { value: 'advantages', color: 'orange' },
    { value: 'gallery', color: 'cyan' },
    { value: 'portfolio', color: 'dark_blue' },
    { value: 'testimonials', color: 'yellow' },
    { value: 'trust', color: 'light_gray' },
    { value: 'faq', color: 'red' },
    { value: 'contact', color: 'dark_green' },
    { value: 'blog', color: 'purple' },
    { value: 'ai-assistant', color: 'pink' },
    { value: 'infinite-zoom', color: 'magenta' },
    { value: 'custom', color: 'gray' }
];

async function getJwt() {
    console.log('🔑 Authenticating Admin...');
    const res = await fetch(`${API_URL}/user/token-auth/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS })
    });
    if (!res.ok) throw new Error('Auth Failed');
    const data = await res.json();
    return data.token;
}

async function fixSchema() {
    console.log('🔧 FIXING SCHEMA FOR TABLE:', TABLE_ID);

    try {
        const jwt = await getJwt();

        // 1. Get Fields (using JWT)
        const fieldsRes = await fetch(`${API_URL}/database/fields/table/${TABLE_ID}/`, {
            headers: { Authorization: `JWT ${jwt}` }
        });
        const fields = await fieldsRes.json();
        const typeField = fields.find((f: any) => f.name === 'Type');

        if (!typeField) {
            console.error('❌ Type field not found');
            return;
        }

        console.log(`✅ Found Type field (ID: ${typeField.id}, Type: ${typeField.type})`);

        if (typeField.type === 'single_select') {
            console.log('⚠️ Already single_select.');
            // Update options just in case to ensure infinite-zoom is there
            // But actually updating field to same type updates options? Yes.
        }

        // 2. Convert to single_select
        console.log('🔄 Converting/Updating to single_select with new options...');
        const updateRes = await fetch(`${API_URL}/database/fields/${typeField.id}/`, {
            method: 'PATCH',
            headers: {
                Authorization: `JWT ${jwt}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'single_select',
                select_options: SECTION_OPTIONS
            })
        });

        if (!updateRes.ok) {
            throw new Error(`Update failed: ${await updateRes.text()}`);
        }

        console.log('🎉 SUCCESS! Field converted/updated.');

    } catch (e) {
        console.error('❌ ERROR:', e);
    }
}

fixSchema();
