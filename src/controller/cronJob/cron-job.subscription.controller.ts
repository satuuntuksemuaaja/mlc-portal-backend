import { ClientTermRepository } from '../../repository/clientterm.repository';
import { BffClientSubscriptionService } from '../../service/subscription/subscription.bff.service';
import { ClientTermStatus } from '../../model/enums/clientterm.enum';
import { ActiveClientSubscription } from '../../interface/response/clientterm.response.interface';
import { ActivitiesRepository } from '../../repository/activities.repository';
import { AgentClientRepository } from '../../repository/agentclient.repository';

export class CornJobSubscription {
  async run() {
    try {
      /**
       * Finds expiring subcriptions for active client ----------------
       */
      const activeClientSubscription: ActiveClientSubscription[] =
        await ClientTermRepository.activeClientSubscription();

      // has expiring subscriptions
      if (activeClientSubscription.length > 0) {
        // eslint-disable-next-line no-loops/no-loops
        for (let x = 0; x < activeClientSubscription.length; x++) {
          const acs = activeClientSubscription[x];

          console.log(
            'Subscription expired (Processing Renewal) for ' +
              acs?.client?.email
          );

          // renew the subscription
          const renew = await this.renewSubscription(acs);

          console.log('Renewal Success: ', renew);

          if (renew) {
            // create activities
            const clientAgents =
              await AgentClientRepository.getAllClientsAgentRelation([
                acs.client.id
              ]);
            const activities = clientAgents.map((data) => {
              return {
                agentId: data.agentId,
                clientId: data.clientId,
                name: data.clientName,
                message: `${data.clientName} - Subscription Extended`,
                section: 'client',
                title: 'Subscription Extended',
                created: new Date()
              };
            });
            await ActivitiesRepository.createBulkActivities(activities);
          }
        }
      }

      /**
       * Find subcription for archived client -----------------------
       */
      const archivedClientSubscription =
        await ClientTermRepository.archivedClientSubscripton();
      if (archivedClientSubscription.lenght > 0) {
        const subscriptionIdsForArchivedClient: string[] = [],
          archivedClientIds: string[] = [];
        /**
         * Creating object for update subscription
         */
        archivedClientSubscription.map((term) => {
          subscriptionIdsForArchivedClient.push(term.id);
          archivedClientIds.push(term.clientId);
        });
        await ClientTermRepository.expireSubscription(
          subscriptionIdsForArchivedClient
        );
        /**
         * Creating object for activity subscription
         */
        if (archivedClientIds.length > 0) {
          const activityObj = [];
          const clientsAgentRelation =
            await AgentClientRepository.getAllClientsAgentRelation(
              archivedClientIds
            );
          // Creating object for email and activity
          clientsAgentRelation.map(async (data) => {
            activityObj.push({
              agentId: data.agentId,
              clientId: data.clientId,
              name: data.clientName,
              message: `${data.clientName} Subsription expired`,
              section: 'client',
              title: 'Subsription expired',
              created: new Date()
            });
          });
          await ActivitiesRepository.createBulkActivities(activityObj);
        }
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  private async renewSubscription(
    term: ActiveClientSubscription
  ): Promise<boolean> {
    const dateAfterYear = new Date();
    dateAfterYear.setDate(dateAfterYear.getDate() + 365);

    const toExpire = '' + term.id;

    console.log('New Expiry: ', dateAfterYear);

    const newTerm = {
      clientId: term?.client?.id,
      durationMonths: 12,
      start: new Date(),
      end: dateAfterYear,
      status: ClientTermStatus.ACTIVE
    };

    // FIXME: move duration to constant or db or ?
    const bffData = {
      organisation_key: term?.client?.organisation?.key,
      duration: 365 * 24 * 60,
      email: term?.client?.email
    };

    console.log('Bff Request: ', bffData);

    try {
      const bffupdated = await new BffClientSubscriptionService().update(
        bffData
      );

      console.log('Bff Update Result: ', bffupdated);

      if (bffupdated.ok) {
        try {
          console.log('Expiring current Subscription ', toExpire);
          await ClientTermRepository.expireSubscription([toExpire]);
        } catch (err) {
          console.log('Expire Subscription Failed: ', err);
          console.log(err);
        }

        try {
          console.log('Creating New Subscription ', newTerm);
          await ClientTermRepository.createSubscription([newTerm]);
        } catch (err) {
          console.log('Creating Subscription Failed: ', err);
          console.log(err);
        }

        return true;
      }

      return false;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
