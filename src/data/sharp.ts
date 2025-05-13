import sharp from 'sharp';

export const grayScaleImage = async (buffer: Buffer): Promise<Buffer> => {
  try {
    const outBuffer = await sharp(buffer).grayscale().toBuffer();
    console.log('Sharp grayscale successful');
    return outBuffer;
  } catch (e) {
    console.error('Grayscale failed:', e);
    throw e;
  }
}

export const cropImage = async (
  buffer: Buffer,
  widthPercent: number,
  heightPercent: number,
  offsetHorizontalPercent: number,
  offsetVerticalPercent: number
): Promise<Buffer> => {
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

  const { height, width } = await getDimensions(buffer);

  const widthPx = Math.round(widthPercent / 100 * width);
  const heightPx = Math.round(heightPercent / 100 * height);
  const offsetHorizontalPx = Math.round(offsetHorizontalPercent / 100 * width);
  const offsetVerticalPx = Math.round(offsetVerticalPercent / 100 * height);

  const outBuffer = await sharp(buffer).extract({ width: widthPx, height: heightPx, left: offsetHorizontalPx, top: offsetVerticalPx }).toBuffer();

  return outBuffer;
}

const getDimensions = async (
  buffer: Buffer
): Promise<{ width: number; height: number }> => {
  const metadata = await sharp(buffer).metadata();
  if (metadata.width && metadata.height) {
    return { width: metadata.width, height: metadata.height };
  } else {
    throw new Error('height and width not identifiable');
  }
}

export const blur = async (buffer: Buffer, blurValue: number): Promise<Buffer> => {
  if (typeof blurValue !== 'number') throw new Error('blurValue must be a number');
  if (blurValue < 1) throw new Error('blurValue must be 1 or greater');

  try {
    const outBuffer = await sharp(buffer).blur(blurValue).toBuffer();
    console.log('Sharp blur successful');
    return outBuffer;
  } catch (e) {
    console.error('Sharp blur failed:', e);
    throw e;
  }
}

export default { grayScaleImage, cropImage, blur };