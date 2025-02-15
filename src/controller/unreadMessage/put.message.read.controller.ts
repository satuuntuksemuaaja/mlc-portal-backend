import { Context } from '@azure/functions';
import { PutMessageAsReadValidation } from '../../joiValidation/unreadMessage/putMessageAsRead.validation.validation';
import { UnreadmessageRepository } from '../../repository/unreadmessage.repository';
import { AdminController } from '../admin.controller';

export class UpdateMessaageAsRead extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<string> {
    const res = await super.isValidUser(this.context);
    if (res == true) {
      const validateRequest =
        await PutMessageAsReadValidation.putMessageAsReadValidation(
          this.context
        );
      if (validateRequest === true) {
        const clientId = this.context.req.params.id;
        try {
          console.log('Updating mesage as read');
          return await UnreadmessageRepository.updateMessageAsRead(clientId);
        } catch (error) {
          console.log(
            'Controller - Put message as read by clientId catch block - ',
            error
          );
          throw error;
        }
      } else {
        throw validateRequest;
      }
    } else {
      throw res;
    }
  }
}
