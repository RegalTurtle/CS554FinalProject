import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/src/lib/session';
import path from 'path';
import { fileURLToPath } from 'url';
import { createPost, getAllPosts } from '@/src/data/posts';
import { ObjectId } from 'mongodb';

// Get __dirname equivalent in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function GET(
  req: Request
) {
  let posts;
  try {
    posts = await getAllPosts();
  } catch (error: any) {
    return NextResponse.json({ error: error }, { status: 500 });
  } finally {
    return NextResponse.json({ posts }, { status: 200 });
  }
}
