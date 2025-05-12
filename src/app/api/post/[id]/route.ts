
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
  } finally {
    return NextResponse.json({ post }, { status: 200 });
  }
}
