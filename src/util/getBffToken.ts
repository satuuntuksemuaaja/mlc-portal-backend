export class BFFHelper {
  public static getURL() {
    try {
      return process.env['BFF_URL'];
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public static getHeader() {
    try {
      const token = process.env['KV_BFF_OUTBOUND_AUTH_HEADER_TOKEN'];
      return token;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
