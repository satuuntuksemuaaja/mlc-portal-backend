import { Context } from '@azure/functions';
import { AdminController } from '../admin.controller';
import { AgentByEmailResponse } from '../../interface/response/agent.response.interface';
import { MeecoItemService } from '../../service/meeco.item.service';
import { ClientRepository } from '../../repository/client.repository';
import { errorResponse } from '../../response/error.response';
import { ItemAttachValidation } from '../../joiValidation/item/itemAttach.validation';
import multipart from 'parse-multipart';
import os from 'os';
import fs from 'fs';
import MeecoAttachmentService from '../../service/meeco.file.service';
import { MeecoShareService } from '../../service/meeco.share.service';
import { MeecoItemConversion } from '../../meeco/item/item.conversion';
import { MeecoItem } from '../../meeco/item/item.model';

export class AttachItemController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<MeecoItem> {
    /**
     * Validate Admin/User
     */
    const res = await super.isValidUser(this.context);
    if (res === true) {
      const validateRequest = await ItemAttachValidation.itemAttachValidation(
        this.context
      );
      if (validateRequest === true) {
        try {
          const currentAgent: AgentByEmailResponse =
            this.userRole?.usermessage?.currentAgent;
          const itemId = this.context?.req?.params?.itemId;
          /**
           * Get Client if not found throw error
           */
          const client = await ClientRepository.getClientById(
            this.context?.req?.params?.clientId,
            currentAgent?.orgId
          );
          if (!client) {
            throw errorResponse({ message: 'Client not found' }, 404);
          }
          console.log('Client exist', client?.email);
          // Loading item ----
          const item = await new MeecoItemService(
            currentAgent?.organisation?.key
          ).getItem(this.context?.req?.params?.itemId);
          if (!item) {
            throw errorResponse({ message: 'Item not available' }, 404);
          }
          console.log('Load item success', item?.id);
          // Loading if item is shared with client
          const isItemSharedWithClient = await new MeecoItemService(
            currentAgent?.organisation?.key
          ).hasSharedItemWithUser(item?.id, client?.meecoUserId);
          if (!isItemSharedWithClient) {
            throw errorResponse(
              { message: 'Item is not shared with client ' },
              404
            );
          }
          console.log(
            'Load item share with client success',
            isItemSharedWithClient
          );

          const bodyBuffer = Buffer.from(this.context?.req?.body);
          const boundary = multipart.getBoundary(
            this.context?.req?.headers['content-type']
          );
          const parts = multipart.Parse(bodyBuffer, boundary);
          console.log('Multipart parse success', parts);
          //Creating Dir ----
          const tempdir = os.tmpdir();
          if (!fs.existsSync(`${tempdir}/MLC`)) {
            fs.mkdirSync(`${tempdir}/MLC`);
          }
          if (!fs.existsSync(`${tempdir}/MLC/${itemId}`)) {
            fs.mkdirSync(`${tempdir}/MLC/${itemId}`);
          }
          console.log('parts.length', parts.length);
          if (parts.length == 1) {
            const fileName = parts[0].filename;
            const data = parts[0].data;

            fs.writeFileSync(
              `${tempdir}/MLC/${itemId}/${fileName}`,
              data,
              'binary'
            );

            const uploaded = await new MeecoAttachmentService(
              currentAgent?.organisation?.key
            ).upload(`${tempdir}/MLC/${itemId}/${fileName}`, fileName, item);

            if (uploaded && uploaded.id) {
              console.log('Upload Complete, Re-Sharing updated Item');
              new MeecoShareService(
                currentAgent?.organisation?.key
              ).reShareItem(item.id);
              console.log('Re-Share complete');
              return new MeecoItemConversion().convert(uploaded);
            }
          }
          return null;
        } catch (error) {
          console.log('Controller - item attach catch block', error);
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
