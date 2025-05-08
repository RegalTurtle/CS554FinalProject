
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from "@/src/lib/session";
import { getUser } from '@/src/data/users';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function GET(req: Request,
    context: { params: Promise<{ id: string }> }) {
    let session
    let user
    try {
        const { id } = await context.params
        user = await getUser(id)
    } catch (error: any) {
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        return NextResponse.json({ user }, { status: 200 });
    }
}
