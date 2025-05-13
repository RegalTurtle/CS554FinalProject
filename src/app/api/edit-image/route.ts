import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/session';
import path from 'path';
import fs from 'fs/promises';
import im from '@/src/data/imageMagick';
import sh from '@/src/data/sharp';

export async function POST(request: Request) {
  const useIM = process.env.USE_IM === 'true';
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

    // get the type of the image provided, if it's not an image, throw error
    let contentType: string;
    if (data.image.contentType.startsWith("image/")) {
      contentType = data.image.contentType.replace("image/", ""); // → "jpeg"
    } else {
      return NextResponse.json(
        { message: 'Provided data was not an image' }
      )
    }

    // Convert the image data back to a Buffer
    const imageBuffer = Buffer.from(data.image.data, `base64`);

    // if we're using IM, run the IM stuff, otherwise flip to sharp stuff
    if (useIM) {
      // create the file path
      const tempDir = path.join(process.cwd(), `.temp`);
      const fileName = `image-${session.userId}.${contentType}`;
      const filePath = path.join(tempDir, fileName);
      const newFileName = `new-image-${session.userId}.${contentType}`;
      const newFilePath = path.join(tempDir, newFileName);

      // if needed, create .temp directory, then save the image to the .temp directory
      await fs.mkdir(tempDir, { recursive: true });
      await fs.writeFile(filePath, imageBuffer)

      // do ImageMagick stuff
      try {
        switch (data.operation) {
          case 'grayscale':
            await im.grayScaleImage(filePath, newFilePath);
            break;
          case 'crop':
            const { widthPercent, heightPercent, offsetHorizontalPercent, offsetVerticalPercent } = data.additionalData;
            await im.cropImage(filePath, newFilePath, widthPercent, heightPercent, offsetHorizontalPercent, offsetVerticalPercent);
            break;
          case 'blur':
            const { blurValue } = data.additionalData;
            await im.blur(filePath, newFilePath, blurValue);
            break;
          default:
            return NextResponse.json(
              { message: `Unknown operation: ${data.operation}` },
              { status: 400 }
            );
        }
      } catch (e: any) {
        return NextResponse.json(
          { message: `Error in ImageMagick: ${e.message}` },
          { status: 500 }
        )
      }

      // return the image
      const newImageBuffer = await fs.readFile(newFilePath);
      const response = new NextResponse(
        newImageBuffer,
        {
          status: 200, headers: {
            'Content-Type': `image/${contentType}`,
            'Content-Disposition': `inline`,
          }
        }
      );

      // delete the images
      await fs.unlink(filePath);
      await fs.unlink(newFilePath);

      // return
      return response;
    } else {
      // do this with sharp
      let newImageBuffer: Buffer;

      try {
        switch (data.operation) {
          case 'grayscale':
            newImageBuffer = await sh.grayScaleImage(imageBuffer);
            break;
          case 'crop':
            const { widthPercent, heightPercent, offsetHorizontalPercent, offsetVerticalPercent } = data.additionalData;
            newImageBuffer = await sh.cropImage(imageBuffer, widthPercent, heightPercent, offsetHorizontalPercent, offsetVerticalPercent);
            break;
          case 'blur':
            const { blurValue } = data.additionalData;
            newImageBuffer = await sh.blur(imageBuffer, blurValue);
            break;
          default:
            return NextResponse.json(
              { message: `Unknown operation: ${data.operation}` },
              { status: 400 }
            );
        }
      } catch (e: any) {
        return NextResponse.json(
          { message: `Error in ImageMagick: ${e.message}` },
          { status: 500 }
        )
      }

      return new NextResponse(
        newImageBuffer,
        {
          status: 200, headers: {
            'Content-Type': `image/${contentType}`,
            'Content-Disposition': `inline`,
          }
        }
      );
    }
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