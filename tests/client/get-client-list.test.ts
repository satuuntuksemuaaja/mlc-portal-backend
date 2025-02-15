import { Context } from '@azure/functions';
import httpTrigger from '../../api-client-list/index';
import { ClientStatus } from '../../src/model/enums/client.enum';
import { TestData } from '../data/testdata';

describe('Test to clients list', () => {
  let context: Context;

  beforeAll(() => {
    jest.setTimeout(60000);
    context = { log: jest.fn() } as unknown as Context;
  });

  it('Valid Admin agent should be able to list clients - Http status code: 200', async () => {
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

    const toCheck = [
      {
        list: context?.res?.body?.active,
        status: ClientStatus.ACTIVE,
        orgId: 'cd0bcea6-551d-11ed-bdc3-0242ac120002'
      },
      {
        list: context?.res?.body?.archived,
        status: ClientStatus.ARCHIVED,
        orgId: 'cd0bcea6-551d-11ed-bdc3-0242ac120002'
      },
      {
        list: context?.res?.body?.cancelled,
        status: ClientStatus.CANCELLED,
        orgId: 'cd0bcea6-551d-11ed-bdc3-0242ac120002'
      },
      {
        list: context?.res?.body?.pending,
        status: ClientStatus.PENDING,
        orgId: 'cd0bcea6-551d-11ed-bdc3-0242ac120002'
      }
    ];

    toCheck.forEach((e) => {
      {
        expect(e.list.length).toBeGreaterThanOrEqual(1);
        expect(e.list.length).toEqual(applyfilter(e.list, e.status, e.orgId));
      }
    });
  });

  function applyfilter(list, status, orgId) {
    return list.filter((d) => d.status === status && d.orgId === orgId).length;
  }

  it('User level agent should be able to list clients', async () => {
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

    const toCheck = [
      {
        list: context?.res?.body?.active,
        status: ClientStatus.ACTIVE,
        orgId: 'cd0bcea6-551d-11ed-bdc3-0242ac120002'
      },
      {
        list: context?.res?.body?.archived,
        status: ClientStatus.ARCHIVED,
        orgId: 'cd0bcea6-551d-11ed-bdc3-0242ac120002'
      },
      {
        list: context?.res?.body?.cancelled,
        status: ClientStatus.CANCELLED,
        orgId: 'cd0bcea6-551d-11ed-bdc3-0242ac120002'
      },
      {
        list: context?.res?.body?.pending,
        status: ClientStatus.PENDING,
        orgId: 'cd0bcea6-551d-11ed-bdc3-0242ac120002'
      }
    ];

    toCheck.forEach((e) => {
      {
        expect(e.list.length).toBeGreaterThanOrEqual(1);
        expect(e.list.length).toEqual(applyfilter(e.list, e.status, e.orgId));
      }
    });
  });

  it('Archived admin agent should fail to list clients', async () => {
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

  it('Archived user agent should fail to list clients', async () => {
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
