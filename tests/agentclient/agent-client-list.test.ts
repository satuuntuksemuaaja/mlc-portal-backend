import { Context } from '@azure/functions';
import httpTrigger from '../../api-agent-client-list/index';
import { TestData } from '../data/testdata';

describe('Test to active client list', () => {
  let context: Context;

  beforeAll(() => {
    jest.setTimeout(60000);
    context = { log: jest.fn() } as unknown as Context;
  });

  it('Valid Admin agent should be able to get agent client list - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        id: '353f8c6a-551e-11ed-bdc3-0242ac120002'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    console.log(
      'Agent client list length should be greater or equal to 1 - ',
      context?.res?.body?.clients?.length
    );
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.clients?.length).toBeGreaterThanOrEqual(1);
    context?.res?.body?.clients.forEach((e) => {
      expect(e.id).toBeDefined();
      expect(e.name).toBeDefined();
      expect(e.email).toBeDefined();
      expect(e.orgId).toBeDefined();
      expect(e.orgId).toEqual('cd0bcea6-551d-11ed-bdc3-0242ac120002');
    });
  });

  it('User level agent should be able to get agent client list', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getUserAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        id: '353f8c6a-551e-11ed-bdc3-0242ac120002'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    console.log(context?.res?.body);
    console.log(
      'Agent client list length should be greater or equal to 1 - ',
      context?.res?.body?.clients.length
    );
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.clients.length).toBeGreaterThanOrEqual(1);
  });

  it('Archived admin agent should fail', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        id: '353f8c6a-551e-11ed-bdc3-0242ac120002'
      }
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
      params: {
        id: '353f8c6a-551e-11ed-bdc3-0242ac120002'
      }
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
      params: {
        id: '353f8c6a-551e-11ed-bdc3-0242ac120002'
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });

  it('Valid admin agent should fail with status code 500', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {}
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
      query: {},
      params: {
        id: '353f8c6a-551e-11ed-bddsdc3-0242ac12000'
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
