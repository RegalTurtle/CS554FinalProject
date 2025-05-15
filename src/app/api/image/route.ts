import { NextResponse } from 'next/server';
import { getPostById } from '@/src/data/posts';
import { ObjectId } from 'mongodb';
import { Binary } from 'bson'; 

export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = params.postId;
    if (!ObjectId.isValid(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    const postResult = await getPostById(new ObjectId(postId));

    if (!postResult.postFound || !postResult.post || !postResult.post.image) {
      return NextResponse.json({ error: 'Image not found or post does not exist' }, { status: 404 });
    }

    const imageData = postResult.post.image; 

    let imageBuffer: Buffer;

    if (imageData instanceof Binary) {
      imageBuffer = Buffer.from(imageData.buffer);
    } else if (imageData instanceof Buffer) {
      imageBuffer = imageData;
    } else {
      console.error("Unexpected image data type for post:", postId, typeof imageData, imageData);
      return NextResponse.json({ error: 'Invalid image data format in database' }, { status: 500 });
    }
    
    if (!(imageBuffer instanceof Buffer)) {
        console.error("Failed to extract Buffer from image data for post:", postId);
        return NextResponse.json({ error: 'Internal error processing image data' }, { status: 500 });
    }

    let contentType = postResult.post.imageMimeType || 'application/octet-stream';
    if (contentType === 'application/octet-stream' && imageBuffer.length > 4) { 
        if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50 && imageBuffer[2] === 0x4E && imageBuffer[3] === 0x47) {
            contentType = 'image/png';
        } else if (imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8 && imageBuffer[imageBuffer.length - 2] === 0xFF && imageBuffer[imageBuffer.length - 1] === 0xD9) {
            contentType = 'image/jpeg';
        }
    }

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable', // Cache for 1 day
      },
    });

  } catch (error) {
    console.error(`Error fetching image for post ${params.postId}:`, error);
    return NextResponse.json({ error: 'Failed to retrieve image' }, { status: 500 });
  }
}