import { Context } from '@azure/functions';
import { AdminController } from '../admin.controller';
import { ExportSubscriptionsResponse } from '../../interface/response/export.response.interface';
import { ExportRepository } from '../../repository/export.repository';
import { AdminExportSubscriptionValidation } from '../../joiValidation/export/adminExportSubscription.validation';

export class AdminExportSubscriptionController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<ExportSubscriptionsResponse> {
    /**
     * Validate Admin
     */
    const res = await super.isValid(this.context);
    if (res === true) {
      const validateRequest =
        await AdminExportSubscriptionValidation.adminExportSubscriptionValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          const orgId = this.userRole?.usermessage?.currentAgent?.orgId;
          const queryData = this.context.req?.query;
          console.log('Getting subscription export', queryData);
          return await ExportRepository.exportSubscriptions(orgId, queryData);
        } catch (error) {
          console.log(
            'Controller - export subscriptions catch block - ',
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
