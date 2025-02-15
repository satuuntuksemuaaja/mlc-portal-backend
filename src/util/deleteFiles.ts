import fs from 'fs';

export class DeleteDirectories {
  public static async deleteDirectories(path: string) {
    const date10MinutesBefore = new Date();
    date10MinutesBefore.setMinutes(date10MinutesBefore.getMinutes() - 10);
    if (fs.existsSync(path)) {
      fs.readdirSync(path).filter(function (file) {
        const FileExist =
          fs.statSync(path + '/' + file).birthtime <= date10MinutesBefore;
        console.log(path + '/' + file);
        if (fs.existsSync(path + '/' + file) && FileExist) {
          fs.rmdirSync(path + '/' + file, {
            recursive: true
          });
          console.log('removed');
        }
      });
    }
  }
}
