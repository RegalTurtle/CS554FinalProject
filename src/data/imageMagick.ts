import im from 'imagemagick';

// scrapping this for the time being because I don't think it makes any sense for users to resize images on their own...
// could be used for pfps?

// export const resizeImage = ({
//   srcPath,
//   dstPath,
//   widthPercent,
//   height,
// }: {
//   srcPath: string;
//   dstPath: string;
//   widthPercent: string;
//   height: string;
// }): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     im.convert([srcPath, '-resize', `${widthPercent}x${height}`, dstPath],
//       (err: Error | null) => {
//         if (err) {
//           console.error('Resize failed:', err);
//           return reject(err);
//         }
//         console.log('Resize successful!');
//         resolve();
//       }
//     );
//   })
// };

export const grayScaleImage = (
  srcPath: string,
  dstPath: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    im.convert([srcPath, '-colorspace', 'Gray', dstPath],
      (err: Error | null) => {
        if (err) {
          console.error('Grayscale failed:', err);
          return reject(err);
        }
        console.log(`Grayscale successful`);
        resolve();
      }
    )
  })
}

export const cropImage = async (
  srcPath: string,
  dstPath: string,
  widthPercent: number,
  heightPercent: number,
  offsetHorizontalPercent: number,
  offsetVerticalPercent: number
): Promise<void> => {
  if (typeof widthPercent !== 'number' ||
    typeof heightPercent !== 'number' ||
    typeof offsetHorizontalPercent !== 'number' ||
    typeof offsetVerticalPercent !== 'number'
  ) throw new Error(`Percentages must be numbers`);

  if (widthPercent < 0 || widthPercent > 100
    || heightPercent < 0 || heightPercent > 100
    || offsetHorizontalPercent < 0 || offsetHorizontalPercent > 100
    || offsetVerticalPercent < 0 || offsetVerticalPercent > 100
  ) throw new Error(`Percentages must be between 0 and 100`)

  const { height, width } = await getDimensions(srcPath);

  const widthPx = Math.round(widthPercent / 100 * width);
  const heightPx = Math.round(heightPercent / 100 * height);
  const offsetHorizontalPx = Math.round(offsetHorizontalPercent / 100 * width);
  const offsetVerticalPx = Math.round(offsetVerticalPercent / 100 * height);

  return new Promise((resolve, reject) => {
    im.convert([srcPath, '-crop', `${widthPx}x${heightPx}+${offsetHorizontalPx}+${offsetVerticalPx}`, dstPath],
      (err: Error | null) => {
        if (err) {
          console.error('Crop failed:', err);
          return reject(err);
        }
        console.log(`Crop successful`);
        resolve();
      }
    );
  })
}

const getDimensions = (
  srcPath: string
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    im.identify(srcPath, (err: Error | null, res) => {
      if (err) return reject(err);
      if (typeof res === 'object' && res.width && res.height) {
        return resolve({ width: res.width, height: res.height });
      }
      return reject(new Error('height and width not identifiable'));
    });
  });
}

export default { grayScaleImage, cropImage };