export class TextFormat {
  public static async getTextFormat(obj) {
    const textFormat = Object.entries(obj)
      .map(([key, value]) => {
        if (key === 'logoThumbnail' || key === 'thumb') {
          return 'Logo / Photo Updated';
        }
        return key + ':' + value;
      })
      .join('\n');
    return textFormat;
  }
}
