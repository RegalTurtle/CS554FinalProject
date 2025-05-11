import im from 'imagemagick';

export const resizeImage = ({
  srcPath,
  dstPath,
  width,
  height,
}: {
  srcPath: string;
  dstPath: string;
  width: string;
  height: string;
}): void => {
  im.convert([srcPath, '-resize', `${width}x${height}`, dstPath], 
    (err: Error | null) => {
      if (err) {
        console.error('Resize failed:', err);
        throw err;
      }
      console.log('Resize successful!');
    }
  );
};

export const grayScaleImage = (
  srcPath: string,
  dstPath: string,
): void => {
  im.convert([srcPath, '-colorspace', 'Gray', dstPath], 
    (err: Error | null) => {
      if (err) {
        console.error('Grayscale failed:', err);
        throw err;
      }
      console.log(`Grayscale successful`);
    }
  )
}

export default { resizeImage, grayScaleImage };