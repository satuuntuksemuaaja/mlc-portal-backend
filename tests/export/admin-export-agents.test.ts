import { Context } from '@azure/functions';
import httpTrigger from '../../api-admin-export-agents/index';
import { TestData } from '../data/testdata';

describe('Test to export agent', () => {
  let context: Context;

  beforeAll(() => {
    jest.setTimeout(60000);
    context = { log: jest.fn() } as unknown as Context;
  });

  it('Valid Admin agent should be able to list agents - Http status code: 200', async () => {
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
      'Export content should be greater or equal to 1 - ',
      context?.res?.body?.content?.length
    );
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.report).toEqual('agents');
    expect(context?.res?.body?.content.length).toBeGreaterThanOrEqual(1);
    context?.res?.body?.content.forEach((e) => {
      expect(e.name).toBeDefined();
      expect(e.email).toBeDefined();
      expect(e.status).toBeDefined();
      expect(e.created).toBeDefined();
      expect(e.lastModified).toBeDefined();
      expect(e.orgId).toBeDefined();
      expect(e.orgId).toEqual('cd0bcea6-551d-11ed-bdc3-0242ac120002');
    });
  });

  it('Valid Admin agent should be able to list agents with date range - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {
        dateFrom: '20-10-2021',
        dateTo: '20-10-2025'
      },
      params: {}
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    console.log(
      'Export content should be greater or equal to 1 - ',
      context?.res?.body?.content?.length
    );
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.report).toEqual('agents');
    expect(context?.res?.body?.content.length).toBeGreaterThanOrEqual(1);
    context?.res?.body?.content.forEach((e) => {
      expect(e.name).toBeDefined();
      expect(e.email).toBeDefined();
      expect(e.status).toBeDefined();
      expect(e.created).toBeDefined();
      expect(e.lastModified).toBeDefined();
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

  it('Valid admin agent should fail with status code 500', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      params: {}
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
        daterFrom: '20/10-/2021', // Invalid date
        daterTo: '20/10-/2025' // Invalid date
      },
      params: {}
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
