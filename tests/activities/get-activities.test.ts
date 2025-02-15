import { Context } from '@azure/functions';
import { TestData } from '../data/testdata';
import httpTrigger from '../../api-activities-list/index';

describe('Test to get activities', () => {
  let context: Context;

  beforeAll(async () => {
    jest.setTimeout(60000);
    context = { log: jest.fn() } as unknown as Context;
  });

  it('Valid Admin agent should be able to get list of activities - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {
        page: '0',
        records: '1'
      },
      params: {}
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    console.log(
      'Activity list length should be greater or equal to 1 - ',
      context?.res?.body?.activities?.length
    );
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.activities?.length).toBeGreaterThanOrEqual(1);
    const agentActivities = context?.res?.body?.activities.filter(
      (data) => data.agentId === '353f8c6a-551e-11ed-bdc3-0242ac120002'
    );
    expect(context?.res?.body?.activities?.length).toEqual(
      agentActivities.length
    );
  });

  it('User level agent should be able to get list of activities - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getUserAgent()
      },
      method: null,
      url: '',
      query: {
        page: '0',
        records: '1'
      },
      params: {}
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    console.log(
      'Activity list length should be greater or equal to 1 - ',
      context?.res?.body?.activities?.length
    );
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.activities?.length).toBeGreaterThanOrEqual(1);
  });

  it('Archived admin agent should fail', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedAdminAgent()
      },
      method: null,
      url: '',
      query: {
        page: '0',
        records: '1'
      },
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
      query: {
        page: '0',
        records: '1'
      },
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
      query: {
        page: '0',
        records: '1'
      },
      params: {}
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });

  it('Valid Admin agent should not be able to get list of activities with invaild request', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {
        pae: '0',
        recoords: '1'
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
