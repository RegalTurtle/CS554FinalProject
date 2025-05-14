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

export async function POST(request: Request) {
  let session: any
  try {
    session = await getSession()
    let userId: string
    if (session?.userId) {
      userId = session.userId
    }
    else {
      return NextResponse.json(
        { message: 'No session found' },
        { status: 400 }
      );
    }
    const data = await request.json();

    // Convert the image data back to a Buffer
    const imageBuffer = Buffer.from(data.image.data);

    const result = await createPost(
      new ObjectId(userId),
      data.title,
      imageBuffer,
      data.caption
    );

    if (!result.postCreated) {
      return NextResponse.json(
        { message: 'Failed to create post' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Post created successfully', post: result.post },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}