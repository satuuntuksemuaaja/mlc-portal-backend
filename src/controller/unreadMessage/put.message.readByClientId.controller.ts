import { Context } from '@azure/functions';
import { PutMessageAsReadByClienIdValidation } from '../../joiValidation/unreadMessage/putMessageAsReadByClientId.validation';
import { UnreadmessageRepository } from '../../repository/unreadmessage.repository';
import { AdminController } from '../admin.controller';

export class UpdateMessaageAsReadByClientId extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<string> {
    const res = await super.isValidUser(this.context);
    if (res == true) {
      const validateRequest =
        await PutMessageAsReadByClienIdValidation.putMessageAsReadByClienIdValidation(
          this.context
        );
      if (validateRequest === true) {
        const clientId = this.context.req.params.clientId;
        try {
          console.log('Updating message as read for client-', clientId);
          return await UnreadmessageRepository.updateMessageAsReadByClientId(
            clientId
          );
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
