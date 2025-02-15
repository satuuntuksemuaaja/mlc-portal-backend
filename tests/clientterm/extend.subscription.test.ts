import { Context } from '@azure/functions';
import { ClientTermStatus } from '../../src/model/enums/clientterm.enum';
import { ClientTermRepository } from '../../src/repository/clientterm.repository';

describe('Test Subscriptions', () => {
  beforeAll(() => {
    jest.setTimeout(60000);
  });

  it('Active Subscription Data', async () => {
    const data = await ClientTermRepository.activeClientSubscription();

    expect(data).toBeDefined();
    expect(data.length).toBeGreaterThan(0);

    data.forEach((e) => expect(e.client?.organisation).toBeDefined());
    data.forEach((e) => expect(e.client?.organisation?.name).toBeDefined());
    data.forEach((e) => expect(e.client?.organisation?.key).toBeDefined());
    // eslint-disable-next-line no-loops/no-loops
    for (let index = 0; index < data?.length; index++) {
      const term = data[index];
      const dateAfterYear = new Date();
      dateAfterYear.setDate(dateAfterYear.getDate() + 365);
      const newTerm = {
        clientId: term?.client?.id,
        durationMonths: 12,
        start: new Date(),
        end: dateAfterYear,
        status: ClientTermStatus.ACTIVE
      };
      await ClientTermRepository.expireSubscription([term.id]);
      await ClientTermRepository.createSubscription([newTerm]);
      const activeSubscription =
        await ClientTermRepository.activeClientSubscription();
      expect(activeSubscription.length).toEqual(0);
    }
  });
});
