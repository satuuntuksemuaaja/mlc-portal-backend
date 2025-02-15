import { Context } from '@azure/functions';
import httpTrigger from '../../api-public-organisation';
import { TestData } from '../data/testdata';

describe('Test to get organisation', () => {
  let context: Context;

  beforeAll(() => {
    jest.setTimeout(60000);
    context = { log: jest.fn() } as unknown as Context;
  });

  it('Anyone can get org - Http status code: 200', async () => {
    context.req = {
      headers: {},
      method: null,
      url: '',
      query: {},
      params: { key: 'acme' }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context.res?.statusCode).toEqual(200);
    expect(context.res?.body?.name).toEqual('ACME');
    expect(context.res?.body?.key).toEqual('acme');
  });

  it('With JWT can get org - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: { key: 'acme' }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context.res?.statusCode).toEqual(200);
    expect(context.res?.body?.name).toEqual('ACME');
    expect(context.res?.body?.key).toEqual('acme');
  });

  it('Invalid Organisation Fails', async () => {
    context.req = {
      headers: {},
      method: null,
      url: '',
      query: {},
      params: { key: 'random' }
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });

  it('Invalid request Fails', async () => {
    context.req = {
      headers: {},
      method: null,
      url: '',
      query: {},
      params: {
        key: 'achme',
        keyw: 'qq'
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 400 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(400);
  });
  // todo key length tests
});
