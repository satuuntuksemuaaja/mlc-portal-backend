import { Context } from '@azure/functions';
import httpTrigger from '../../api-bff-item-shared/index';

describe('Test to agent list', () => {
  let context: Context;

  beforeAll(() => {
    jest.setTimeout(60000);
    context = { log: jest.fn() } as unknown as Context;
  });
  it('Valid Admin - Client share item/message - Http status code: 200', async () => {
    context.req = {
      headers: {
        token: process.env['KV_BFF_INBOUND_AUTH_TOKEN']
      },
      method: null,
      url: '',
      query: {},
      params: {},
      body: {
        email: 'ryanhendo+pp-acme-activeclient@gmail.com',
        organisation_key: 'acme',
        share_id: '123-456',
        type: 'message'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
  });

  it('Valid User - Client share item/message - Http status code: 200', async () => {
    context.req = {
      headers: {
        token: process.env['KV_BFF_INBOUND_AUTH_TOKEN']
      },
      method: null,
      url: '',
      query: {},
      params: {},
      body: {
        email: 'ryanhendo+pp-acme-activeclient@gmail.com',
        organisation_key: 'acme',
        share_id: '123-456',
        type: 'message'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
  });

  it('Request with invalid email will fail', async () => {
    context.req = {
      headers: {
        token: process.env['KV_BFF_INBOUND_AUTH_TOKEN']
      },
      method: null,
      url: '',
      query: {},
      params: {},
      body: {
        email: 'ryann@gmail.com',
        organisation_key: 'acme',
        share_id: '123-456',
        type: 'message'
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });

  it('Request with client not associate with organisation will fail', async () => {
    context.req = {
      headers: {
        token: process.env['KV_BFF_INBOUND_AUTH_TOKEN']
      },
      method: null,
      url: '',
      query: {},
      params: {},
      body: {
        email: 'ryanhendo+pp-acme-activeclient@gmail.com',
        organisation_key: 'pluto',
        share_id: '123-456',
        type: 'message'
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });

  it('Request with invalid organisation will fail', async () => {
    context.req = {
      headers: {
        token: process.env['KV_BFF_INBOUND_AUTH_TOKEN']
      },
      method: null,
      url: '',
      query: {},
      params: {},
      body: {
        email: 'ryanhendo+pp-acme-activeclient@gmail.com',
        organisation_key: 'acmmme',
        share_id: '123-456',
        type: 'message'
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });
  it('Invalid request will fail', async () => {
    context.req = {
      headers: {
        token: process.env['KV_BFF_INBOUND_AUTH_TOKEN']
      },
      method: null,
      url: '',
      query: {},
      params: {},
      body: {
        email: 'ryanhendo+pp-acme-activeclient@gmail.co',
        organisation_key: 12,
        share_id: 123456,
        type: 'messed'
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 400 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(400);
  });

  it('Invalid header token', async () => {
    context.req = {
      headers: {
        token: 'asdasfasf'
      },
      method: null,
      url: '',
      query: {},
      params: {}
    };
    await httpTrigger(context);
    console.log('Fail with status code 401 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(401);
  });
});
