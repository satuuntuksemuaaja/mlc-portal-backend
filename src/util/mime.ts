export class MimeHelper {
  private static readonly mimetypes = [
    { ext: '.jpg', mime: 'image/jpg' },
    { ext: '.jpeg', mime: 'image/jpeg' },
    { ext: '.gif', mime: 'image/gif' },
    { ext: '.png', mime: 'image/png' },
    { ext: '.mp4', mime: 'video/mp4' },
    { ext: '.mpeg', mime: 'video/mpeg' },
    { ext: '.mpg', mime: 'video/mpeg' },
    { ext: '.mp3', mime: 'audio/mpeg' },
    { ext: '.pdf', mime: 'application/pdf' },

    { ext: '.doc', mime: 'application/msword' },
    { ext: '.mov', mime: 'video/quicktime' },
    {
      ext: '.docx',
      mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
  ];

  public static getMime(filename: string): string {
    const m = MimeHelper.mimetypes.find((e) =>
      filename.toLocaleLowerCase().endsWith(e.ext)
    )?.mime;
    return m ? m : 'text/plain';
  }
}
