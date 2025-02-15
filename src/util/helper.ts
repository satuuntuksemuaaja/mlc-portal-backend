export class Helper {
  public async generateFourDigitRandomNumber() {
    return Math.floor(1000 + Math.random() * 9000);
  }
}
