import { Context } from '@azure/functions';
import { TestData } from '../data/testdata';
import httpTrigger from '../../api-admin-agent-active-client-list/index';

describe('Test to agent list', () => {
  let context: Context;

  beforeAll(() => {
    jest.setTimeout(60000);
    context = { log: jest.fn() } as unknown as Context;
  });

  it('Valid Admin agent should be able to get active client list of status active - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {
        archived: 'false'
      },
      params: {
        id: '353f8c6a-551e-11ed-bdc3-0242ac120002'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    console.log(
      'Active client list length should be greater or equal to 1 - ',
      context?.res?.body?.clients.length
    );
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.clients.length).toBeGreaterThanOrEqual(1);

    context?.res?.body?.clients.forEach((e) => {
      expect(e.id).toBeDefined();
      expect(e.name).toBeDefined();
      expect(e.email).toBeDefined();
      expect(e.created).toBeDefined();
      expect(e.agentId).toBeDefined();
      expect(e.orgId).toBeDefined();
      expect(e.orgId).toEqual('cd0bcea6-551d-11ed-bdc3-0242ac120002');
    });
  });

  it('Valid Admin agent should be able to get active client list of all status  - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {
        archived: 'true'
      },
      params: {
        id: '353f8c6a-551e-11ed-bdc3-0242ac120002'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    console.log(
      'Active client list length should be greater or equal to 1 - ',
      context?.res?.body?.clients.length
    );
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.clients.length).toBeGreaterThanOrEqual(4);

    context?.res?.body?.clients.forEach((e) => {
      expect(e.id).toBeDefined();
      expect(e.name).toBeDefined();
      expect(e.email).toBeDefined();
      expect(e.created).toBeDefined();
      expect(e.agentId).toBeDefined();
      expect(e.orgId).toBeDefined();
      expect(e.orgId).toEqual('cd0bcea6-551d-11ed-bdc3-0242ac120002');
    });
  });

  it('User level agent should fail', async () => {
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

  it('Archived admin agent should fail', async () => {
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

  it('Archived user agent should fail', async () => {
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

  it('Valid Admin agent should fail with status code 500', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {
        archived: 'false'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 500 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(500);
  });
  it('Valid Admin agent should fail with status code 400 for invalid request', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {
        arcved: 'false'
      },
      params: {
        id: '353f8c6a-551e-11ed-bdc3-0242ac1'
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 400 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(400);
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
