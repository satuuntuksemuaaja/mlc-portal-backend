import * as postmark from 'postmark';
import { commonResponse } from '../response/common.response';
export class SendEmail {
  private postmarkClient;
  constructor() {
    this.postmarkClient = new postmark.ServerClient(
      process.env['KV_POSTMARK_SERVER_API_TOKEN']
    );
  }
  /**
   * Sending mails with template.
   * @param emailInfo
   * @returns
   */
  async sendEmail(emailInfo) {
    try {
      const data = await this.postmarkClient.sendEmailWithTemplate(emailInfo);
      console.log('Sending mail to:-', data);
      return data;
    } catch (error) {
      console.error(error, '-----in catch block on send email.');
      return await commonResponse(false, true, 500, {
        error: 'Somthing went wrong.'
      });
    }
  }

  async sendBatchEmail(emailInfo) {
    try {
      const data = await this.postmarkClient.sendEmailBatchWithTemplates(
        emailInfo
      );
      console.log('Sending batch mail to:-', data);
      return data;
    } catch (error) {
      console.error(error, '-----in catch block on send batch email.');
      return await commonResponse(false, true, 500, {
        error: 'Somthing went wrong.'
      });
    }
  }
}
