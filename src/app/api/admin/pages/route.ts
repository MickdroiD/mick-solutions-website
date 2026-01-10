
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';
import {
    createPage,
    updatePage,
    deletePage,
    getPages
} from '@/lib/factory-client';
import { PageSchema } from '@/lib/schemas/factory';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: List all pages (Useful if we want isolated fetch)
export async function GET() {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const pages = await getPages();
        return NextResponse.json(pages);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
    }
}

// POST: Create a new page
export async function POST(req: NextRequest) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        // Basic validation
        const parsed = PageSchema.omit({ id: true }).safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

        const id = await createPage(parsed.data);
        return NextResponse.json({ id });
    } catch {
        return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
    }
}

// PUT: Update a page
export async function PUT(req: NextRequest) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { id, ...updates } = body;
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await updatePage(id, updates);
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
    }
}

// DELETE: Delete a page
export async function DELETE(req: NextRequest) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        await deletePage(parseInt(id, 10));
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
    }
}
