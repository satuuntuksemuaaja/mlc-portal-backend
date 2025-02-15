import sharp from 'sharp';

export class ResizeImage {
  public static async resizeImage(
    image: string,
    imageOf: string
  ): Promise<string> {
    try {
      const parts = image.split(';');
      const mimType = parts[0].split(':')[1];
      const imageData = parts[1].split(',')[1];
      let resizedImageBuffer: Buffer,
        resizedImageData: string,
        resizedBase64: string;

      const img = new Buffer(imageData, 'base64');
      const imageDimension = await sharp(img).metadata();
      console.log(imageDimension.width, imageDimension.height);
      if (
        imageOf === 'organisation' &&
        (imageDimension.height > 800 || imageDimension.width > 800)
      ) {
        resizedImageBuffer = await sharp(img).resize(800, 800).toBuffer();
        resizedImageData = resizedImageBuffer.toString('base64');
        resizedBase64 = `data:${mimType};base64,${resizedImageData}`;
        return resizedBase64;
      } else if (
        imageOf === 'agent' &&
        (imageDimension.height > 128 || imageDimension.width > 128)
      ) {
        resizedImageBuffer = await sharp(img).resize(128, 128).toBuffer();
        resizedImageData = resizedImageBuffer.toString('base64');
        resizedBase64 = `data:${mimType};base64,${resizedImageData}`;
        return resizedBase64;
      }
    } catch (error) {
      console.log(error, 'Util Resize Image');
      return 'failed';
    }
  }
}
