
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from "@/src/lib/session";
import { getUser } from '@/src/data/users';
import { getAllPostsByUser } from '@/src/data/posts';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function GET(req: Request,
    context: { params: Promise<{ userId: string }> }) {
    let session
    let posts
    try {
        const { userId } = await context.params
        posts = await getAllPostsByUser(userId)
    } catch (error: any) {
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        return NextResponse.json({ posts: posts }, { status: 200 });
    }
}
