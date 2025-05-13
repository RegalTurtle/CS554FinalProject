import { getPostById } from '@/src/data/posts';
import { NextResponse } from 'next/server';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  let post;
  let session;
  try {
    const { id } = await context.params;
    post = await getPostById(id);
  } catch (error: any) {
    return NextResponse.json({ error }, { status: 500 });
  } finally {
    return NextResponse.json({ post: post }, { status: 200 });
  }
}
