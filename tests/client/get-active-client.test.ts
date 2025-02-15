import { Context } from '@azure/functions';
import httpTrigger from '../../api-client-active-list/index';
import { ClientStatus } from '../../src/model/enums/client.enum';
import { TestData } from '../data/testdata';

describe('Test to active client list', () => {
  let context: Context;

  beforeAll(() => {
    jest.setTimeout(60000);
    context = { log: jest.fn() } as unknown as Context;
  });

  it('Valid Admin agent should be able to list active clients - Http status code: 200', async () => {
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

    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.active.length).toBeGreaterThanOrEqual(1);
    const activeClients = context?.res?.body?.active.filter(
      (data) =>
        data.status === ClientStatus.ACTIVE &&
        data.orgId === 'cd0bcea6-551d-11ed-bdc3-0242ac120002'
    );
    expect(context?.res?.body?.active?.length).toEqual(activeClients.length);

    expect(context?.res?.body?.pending?.length).toBeGreaterThanOrEqual(1);
    const pendingClients = context?.res?.body?.pending.filter(
      (data) =>
        data.status === ClientStatus.PENDING &&
        data.orgId === 'cd0bcea6-551d-11ed-bdc3-0242ac120002'
    );
    expect(context?.res?.body?.pending?.length).toEqual(pendingClients.length);
  });

  it('User level agent should be able to list active clients', async () => {
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
    console.log('Success with status code 200 - ', context?.res?.statusCode);

    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.active.length).toBeGreaterThanOrEqual(1);
    const activeClients = context?.res?.body?.active.filter(
      (data) => data.status === ClientStatus.ACTIVE
    );
    expect(context?.res?.body?.active?.length).toEqual(activeClients.length);

    expect(context?.res?.body?.pending?.length).toBeGreaterThanOrEqual(1);
    const pendingClients = context?.res?.body?.pending.filter(
      (data) => data.status === ClientStatus.PENDING
    );
    expect(context?.res?.body?.pending?.length).toEqual(pendingClients.length);
  });

  it('Archived admin agent should fail to list active clients', async () => {
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

  it('Archived user agent should fail to list active clients', async () => {
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

  it('Non Registered (In DB) agent should fail', async () => {
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
