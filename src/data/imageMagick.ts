import im from 'imagemagick';

export default {};

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
    (err: Error | null, stdout: string) => {
      if (err) {
        console.error('Resize failed:', err);
        throw err;
      }
      console.log('Resize successful!');
      console.log(`stdout: ${stdout}`);
    });
};