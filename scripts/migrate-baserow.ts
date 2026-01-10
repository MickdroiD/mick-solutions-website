import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : path.resolve(process.cwd(), '.env');
console.log(`🔌 Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

const BASEROW_API_URL = process.env.BASEROW_API_URL || 'https://baserow.mick-solutions.ch/api';
const BASEROW_TOKEN = process.env.BASEROW_API_TOKEN;
const SECTIONS_TABLE_ID = process.env.BASEROW_FACTORY_SECTIONS_ID;

if (!BASEROW_TOKEN || !SECTIONS_TABLE_ID) {
    console.error('❌ Missing environment variables: BASEROW_API_TOKEN or BASEROW_FACTORY_SECTIONS_ID');
    console.error('Values found:', {
        token: BASEROW_TOKEN ? '***' : 'missing',
        tableId: SECTIONS_TABLE_ID
    });
    process.exit(1);
}

// Logging helpers
function logInfo(msg: string, data?: unknown) {
    console.log(`ℹ️  ${msg}`, data ? JSON.stringify(data, null, 2) : '');
}

function logSuccess(msg: string) {
    console.log(`✅ ${msg}`);
}

function logError(msg: string, error?: unknown) {
    console.error(`❌ ${msg}`, error);
}

// ---------------------------------------------------------
// AUTHENTICATION
// ---------------------------------------------------------

async function getAdminToken(): Promise<string> {
    const email = process.env.BASEROW_ADMIN_EMAIL;
    const password = process.env.BASEROW_ADMIN_PASSWORD;

    if (!email || !password) {
        throw new Error('BASEROW_ADMIN_EMAIL and BASEROW_ADMIN_PASSWORD are required for schema changes.');
    }

    logInfo(`🔑 Authenticating as ${email}...`);
    const response = await fetch(`${BASEROW_API_URL}/user/token-auth/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Authentication failed (${response.status}): ${errorText}`);
    }

    const json = await response.json();
    return json.token;
}

// ---------------------------------------------------------
// API WRAPPERS
// ---------------------------------------------------------

async function baserowRequest(endpoint: string, method: string = 'GET', body?: unknown, jwtToken?: string) {
    const url = `${BASEROW_API_URL}${endpoint}`;

    // Choose Authorization header: JWT (Admin) or Token (Database)
    // Schema operations (create table/field) require JWT.
    // Data operations (read/write rows) can use Token.
    const authHeader = jwtToken ? `JWT ${jwtToken}` : `Token ${BASEROW_TOKEN}`;

    const headers: HeadersInit = {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
    };

    try {
        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status} on ${endpoint}: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

// ---------------------------------------------------------
// MIGRATION LOGIC
// ---------------------------------------------------------

async function migrate() {
    logInfo('🚀 Starting Factory V3 Database Migration (Multi-Page)...');

    try {
        // 0. Authenticate as Admin
        const jwtToken = await getAdminToken();
        logSuccess('🔑 Admin authenticated successfully!');

        // 1. Get Database ID from Sections Table
        logInfo(`1️⃣  Fetching table details for Sections Table ID: ${SECTIONS_TABLE_ID}`);
        // Use JWT for table metadata as well
        const sectionsTable = await baserowRequest(`/database/tables/${SECTIONS_TABLE_ID}/`, 'GET', undefined, jwtToken);
        const databaseId = sectionsTable.database_id;
        logInfo(`   => Database ID: ${databaseId}`);

        // 2. Check if PAGES table exists
        logInfo('2️⃣  Checking if PAGES table exists...');
        // Listing tables requires Database Token or JWT. Let's use JWT to be safe for metadata.
        const tables = await baserowRequest(`/database/tables/database/${databaseId}/`, 'GET', undefined, jwtToken);
        let pagesTable = tables.find((t: any) => t.name === 'PAGES');

        if (pagesTable) {
            logInfo(`   => PAGES table already exists (ID: ${pagesTable.id}). safe to proceed.`);
        } else {
            logInfo('   => Creating PAGES table...');
            // CREATE TABLE -> Requires JWT
            pagesTable = await baserowRequest(`/database/tables/database/${databaseId}/`, 'POST', {
                name: 'PAGES'
            }, jwtToken);
            logSuccess(`   => PAGES table created! (ID: ${pagesTable.id})`);
        }

        const pagesTableId = pagesTable.id;

        // 3. Ensure Fields in PAGES table
        logInfo('3️⃣  Ensuring fields in PAGES table...');
        // LIST FIELDS -> Requires JWT or Token.
        const pagesFields = await baserowRequest(`/database/fields/table/${pagesTableId}/`, 'GET', undefined, jwtToken);

        // We expect fields: Name (text), Slug (text), SeoTitle (text), SeoDescription (text)
        // Note: When creating a table, a primary text field 'Name' is usually created. Let's check.

        const fieldsToCreate = [
            { name: 'Slug', type: 'text', text_default: '' },
            { name: 'SeoTitle', type: 'text', text_default: '' },
            { name: 'SeoDescription', type: 'long_text' } // Use long_text for description
        ];

        // Rename primary field if needed (usually it's 'Name' by default)
        // For now, we assume the checked Name field works or we create it.
        // If table was just created, it has a primary field 'Name'.

        for (const fieldDef of fieldsToCreate) {
            const exists = pagesFields.find((f: any) => f.name === fieldDef.name);
            if (!exists) {
                logInfo(`   => Creating field: ${fieldDef.name}`);
                await baserowRequest(`/database/fields/table/${pagesTableId}/`, 'POST', fieldDef, jwtToken);
            } else {
                logInfo(`   => Field ${fieldDef.name} already exists.`);
            }
        }

        // 4. Create "Accueil" Page if not exists
        logInfo('4️⃣  Ensuring "Accueil" page exists...');
        const pagesRows = await baserowRequest(`/database/rows/table/${pagesTableId}/?user_field_names=true`);
        let homePage = pagesRows.results.find((r: any) => r.Slug === '/' || r.Name === 'Accueil' || r.Slug === 'home');

        if (!homePage) {
            logInfo('   => Creating "Accueil" page...');
            // Creating rows: standard token is fine!
            homePage = await baserowRequest(`/database/rows/table/${pagesTableId}/?user_field_names=true`, 'POST', {
                Name: 'Accueil',
                Slug: 'home', // or '/' ? Let's use 'home' as internal representation for root, or '/'
                SeoTitle: 'Accueil',
                SeoDescription: 'Page d\'accueil par défaut'
            });
            logSuccess(`   => "Accueil" page created (ID: ${homePage.id})`);
        } else {
            logInfo(`   => "Accueil" page found (ID: ${homePage.id})`);
        }

        // 5. Add 'Page' Link Row field to SECTIONS table
        logInfo('5️⃣  Checking "Page" link field in SECTIONS table...');
        const sectionsFields = await baserowRequest(`/database/fields/table/${SECTIONS_TABLE_ID}/`, 'GET', undefined, jwtToken);

        // Check for ANY field named 'Page'
        const existingPageField = sectionsFields.find((f: any) => f.name === 'Page');
        let pageLinkField: any;

        if (existingPageField) {
            logInfo(`   => Field "Page" found (ID: ${existingPageField.id}, Type: ${existingPageField.type})`);
            if (existingPageField.type === 'link_row') {
                pageLinkField = existingPageField;
                logInfo('   => It is already a link_row. Good.');
            } else {
                logInfo('   ⚠️ Field "Page" exists but is NOT a link_row (Type: ' + existingPageField.type + ').');
                logInfo('   🔄 Renaming legacy field "Page" to "Page_Legacy"...');

                await baserowRequest(`/database/fields/${existingPageField.id}/`, 'PATCH', {
                    name: 'Page_Legacy'
                }, jwtToken);
                logSuccess('   => Renamed to "Page_Legacy".');

                logInfo('   => Creating new "Page" link_row field...');
                pageLinkField = await baserowRequest(`/database/fields/table/${SECTIONS_TABLE_ID}/`, 'POST', {
                    name: 'Page',
                    type: 'link_row',
                    link_row_table_id: pagesTableId
                }, jwtToken);
                logSuccess(`   => "Page" field created (ID: ${pageLinkField.id})`);
            }
        } else {
            logInfo('   => Creating "Page" link_row field...');
            pageLinkField = await baserowRequest(`/database/fields/table/${SECTIONS_TABLE_ID}/`, 'POST', {
                name: 'Page',
                type: 'link_row',
                link_row_table_id: pagesTableId
            }, jwtToken);
            logSuccess(`   => "Page" field created (ID: ${pageLinkField.id})`);
        }

        // 6. Link Orphan Sections to Home Page
        logInfo('6️⃣  Linking orphan sections to "Accueil"...');
        // Fetch all sections
        // Note: Baserow pagination might be needed if > 100 rows. Assuming < 100 for now or user size param.
        const allSections = await baserowRequest(`/database/rows/table/${SECTIONS_TABLE_ID}/?user_field_names=true&size=200`);

        const orphanSections = allSections.results.filter((s: any) => !s.Page || s.Page.length === 0);
        logInfo(`   => Found ${orphanSections.length} orphan sections.`);

        if (orphanSections.length > 0) {
            for (const section of orphanSections) {
                logInfo(`      -> Linking Section ${section.id} (${section.Name || 'Untitled'}) to Home...`);
                // Update row
                await baserowRequest(`/database/rows/table/${SECTIONS_TABLE_ID}/${section.id}/?user_field_names=true`, 'PATCH', {
                    Page: [homePage.id] // Link row expects array of IDs
                });
            }
            logSuccess('   => All orphan sections linked!');
        } else {
            logInfo('   => No orphan sections to link.');
        }

        logSuccess('🎉 Migration successfully completed!');

    } catch (error) {
        logError('Migration Failed', error);
        process.exit(1);
    }
}

migrate();
