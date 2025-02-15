import { Context } from '@azure/functions';
import httpTrigger from '../../api-admin-clients-pending-list/index';
import { ClientStatus } from '../../src/model/enums/client.enum';
import { TestData } from '../data/testdata';

describe('Test to pending client list', () => {
  let context: Context;

  beforeAll(() => {
    jest.setTimeout(60000);
    context = { log: jest.fn() } as unknown as Context;
  });

  it('Valid Admin agent should be able to list pending clients - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {}
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    console.log(
      'Agent list length should be greater or equal to 1 - ',
      context?.res?.body?.clients.length
    );
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.clients.length).toBeGreaterThanOrEqual(1);
    const pendingClients = context?.res?.body?.clients.filter(
      (data) =>
        data.status === ClientStatus.PENDING &&
        data.orgId === 'cd0bcea6-551d-11ed-bdc3-0242ac120002'
    );
    expect(context?.res?.body?.clients?.length).toEqual(pendingClients.length);
  });

  it('User level agent should fail to list pending clients', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getUserAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {}
    };
    await httpTrigger(context);
    console.log('Fail with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('Archived Admin Agent Should Fail to list pending clients', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {}
    };
    await httpTrigger(context);
    console.log('Fail with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('Archived user agent should fail to list pending clients', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedUserAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {}
    };
    await httpTrigger(context);
    console.log('Fail with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('Non Registered (In DB) agent should fail to list pending clients', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getNonConfiguredAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {}
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });

  it('Invalid header token', async () => {
    context.req = {
      headers: {
        authorization: ''
      },
      method: null,
      url: '',
      query: {},
      params: {}
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });
});
