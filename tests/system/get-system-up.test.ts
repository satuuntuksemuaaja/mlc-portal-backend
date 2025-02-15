import { Context } from '@azure/functions';
import httpTrigger from '../../api-public-system-up/index';
import { TestData } from '../data/testdata';

describe('Test for system up', () => {
  let context: Context;

  beforeAll(() => {
    jest.setTimeout(60000);
    context = { log: jest.fn() } as unknown as Context;
  });
  it('Valid Admin agent should be able to get system up - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'GET',
      url: '',
      query: {},
      params: {}
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context.res?.statusCode).toEqual(200);
    expect(context.res?.body?.message).toBeDefined();
  });

  it('User level agent should able to get system up', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getUserAgent()
      },
      method: 'GET',
      url: '',
      query: {},
      params: {}
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context.res?.statusCode).toEqual(200);
    expect(context.res?.body?.message).toBeDefined();
  });

  it('Anyone should be able to get system up', async () => {
    context.req = {
      headers: {},
      method: 'GET',
      url: '',
      query: {},
      params: {}
    };
    await httpTrigger(context);
    expect(context?.res?.statusCode).toEqual(200);
  });
});
