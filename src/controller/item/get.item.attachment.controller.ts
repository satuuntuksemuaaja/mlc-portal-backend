import { Context } from '@azure/functions';
import { AdminController } from '../admin.controller';
import { AgentByEmailResponse } from '../../interface/response/agent.response.interface';
import { MeecoItemService } from '../../service/meeco.item.service';
import { ClientRepository } from '../../repository/client.repository';
import { errorResponse } from '../../response/error.response';
import MeecoAttachmentService from '../../service/meeco.file.service';
import { DownloadItemAttachmentValidation } from '../../joiValidation/item/downloadItemAttachment.validation';
import { EncryptionKey } from '@meeco/cryppo';
import { DirectAttachment, RemoteFile } from '@meeco/vault-api-sdk';
import { ShareService } from '@meeco/sdk';
import { MeecoShareService } from '../../service/meeco.share.service';

export class GetItemAttachmentController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<{
    data: Buffer;
    info: RemoteFile;
  }> {
    /**
     * Validate Admin/User
     */
    const res = await super.isValidUser(this.context);
    if (res === true) {
      const validateRequest =
        await DownloadItemAttachmentValidation.itemAttachmentDownloadValidation(
          this.context
        );

      if (validateRequest === true) {
        try {
          const currentAgent: AgentByEmailResponse =
            this.userRole?.usermessage?.currentAgent;

          const clientId = this.context?.req?.params?.clientId;
          const itemId = this.context?.req?.params?.itemId;
          const attachmentId = this.context?.req?.params?.attachmentId;

          console.log(clientId, itemId, attachmentId);

          /**
           * Get Client if not found throw error
           */
          const client = await ClientRepository.getClientById(
            clientId,
            currentAgent?.orgId
          );
          if (!client) {
            throw errorResponse({ message: 'Client not found' }, 404);
          }

          //FIXME: Can this item check be skipped? Just check the share?
          // Loading item ----
          const item = await new MeecoItemService(
            currentAgent?.organisation?.key
          ).getItem(itemId);
          if (!item) {
            throw errorResponse({ message: 'Item not available' }, 404);
          }
          console.log('load item success', item);
          if (item.own) {
            // Check item is shared with client
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
              'Item shared with client success',
              isItemSharedWithClient
            );
          } else {
            if (item.owner_id !== client?.meecoUserId) {
              const share = await new MeecoShareService(
                currentAgent?.organisation?.key
              ).getShare(item.share_id);
              console.log('Get share success', share);
              if (
                share.share.sender_id !== client?.meecoUserId &&
                share.share.owner_id !== client?.meecoUserId
              ) {
                throw errorResponse(
                  {
                    message:
                      'Permission Denied - Attachment does not belong to client.'
                  },
                  404
                );
              }
            }
          }

          const attachmentData = item.attachments.find(
            (e) => e.id === this.context?.req?.params?.attachmentId
          );
          const attachmentSlot = item.slots.find(
            (e) => e.attachment_id === attachmentData?.id
          );

          const dl = await new MeecoAttachmentService(
            currentAgent?.organisation?.key
          ).download(
            attachmentData.id,
            EncryptionKey.fromSerialized(attachmentSlot.value)
          );
          console.log('download success', dl);
          return dl;
        } catch (error) {
          console.log('Controller - create item catch block', error);
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
