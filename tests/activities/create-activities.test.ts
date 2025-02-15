import { ActivitiesRepository } from '../../src/repository/activities.repository';

describe('Test to get activities', () => {
  beforeAll(async () => {
    jest.setTimeout(60000);
  });

  it('Invalid header token', async () => {
    const date = new Date();
    const activities = await ActivitiesRepository.createBulkActivities([
      {
        agentId: '896e965a-551e-11ed-bdc3-0242ac120002',
        clientId: '9036af30-551f-11ed-bdc3-0242ac120002',
        name: 'client',
        message: `Item shared with client`,
        section: 'client',
        title: 'Item Shared To Client',
        created: date
      }
    ]);
    expect(activities[0].agentId).toEqual(
      '896e965a-551e-11ed-bdc3-0242ac120002'
    );
    expect(activities[0].clientId).toEqual(
      '9036af30-551f-11ed-bdc3-0242ac120002'
    );
    expect(activities[0].name).toEqual('client');
    expect(activities[0].message).toEqual('Item shared with client');
    expect(activities[0].section).toEqual('client');
    expect(activities[0].title).toEqual('Item Shared To Client');
    expect(activities[0].created?.getDate()).toEqual(date.getDate());
  });
});
