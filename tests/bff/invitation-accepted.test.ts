import { Context } from '@azure/functions';
import httpTrigger from '../../api-bff-invitation-accepted/index';

describe('Test to agent list', () => {
  let context: Context;

  beforeAll(() => {
    jest.setTimeout(60000);
    context = { log: jest.fn() } as unknown as Context;
  });

  it('User with valid token will be able to access service', async () => {
    context.req = {
      headers: {
        token: process.env['KV_BFF_INBOUND_AUTH_TOKEN']
      },
      method: null,
      url: '',
      query: {},
      params: {},
      body: {
        organisation_key: 'acme',
        email: 'ryanhendo+pp-acme-activeclient@gmail.com',
        userid: '123456',
        connectionid: '123456',
        subscriptionid: '123456'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
  });

  it('User with invalid token will not be able to access service', async () => {
    context.req = {
      headers: {
        token: 'aafsdafasdfasdfasdzxc'
      },
      method: null,
      url: '',
      query: {},
      params: {},
      body: {
        organisation_key: 'acme',
        email: 'ryanhendo+pp-acme-activeclient@gmail.com',
        userid: '123456',
        connectionid: '123456',
        subscriptionid: '123456'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(401);
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
        organisation_key: 'acme',
        email: 'xyz122@gmail.com',
        userid: '123456',
        connectionid: '123456',
        subscriptionid: '123456'
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });

  it('Request with invalid organisation key will fail', async () => {
    context.req = {
      headers: {
        token: process.env['KV_BFF_INBOUND_AUTH_TOKEN']
      },
      method: null,
      url: '',
      query: {},
      params: {},
      body: {
        organisation_key: 'ooo12',
        email: 'ryanhendo+pp-acme-activeclient@gmail.com',
        userid: '123456',
        connectionid: '123456',
        subscriptionid: '123456'
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });

  // because ryan commented this check --------------
  // it('Request with client not associate with agent will fail', async () => {
  //   context.req = {
  //     headers: {
  //       token: process.env['KV_BFF_INBOUND_AUTH_TOKEN']
  //     },
  //     method: null,
  //     url: '',
  //     query: {},
  //     params: {},
  //     body: {
  //       organisation_key: 'acme',
  //       email: 'client-not-associated-with-agent@plutolaw.com',
  //       userid: '123456',
  //       connectionid: '123456',
  //       subscriptionid: '123456'
  //     }
  //   };
  //   await httpTrigger(context);
  //   console.log('Fail with status code 404 - ', context?.res?.statusCode);
  //   expect(context?.res?.statusCode).toEqual(404);
  // });

  it('User with valid token will not be able to access service with invalid request', async () => {
    context.req = {
      headers: {
        token: process.env['KV_BFF_INBOUND_AUTH_TOKEN']
      },
      method: null,
      url: '',
      query: {},
      params: {},
      body: {
        organisation_ky: 12,
        email: 'ryanhendo+pp-acme-activeclient@gmail.yaho',
        userid: 123456,
        connectionid: 123456,
        subscriptionid: 123456
      }
    };
    await httpTrigger(context);
    console.log('Failed with status code 400 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(400);
  });

  it('Invalid BFF token', async () => {
    context.req = {
      headers: {
        token: ''
      },
      method: null,
      url: '',
      query: {},
      params: {},
      body: {
        organisation_key: 'acme',
        email: 'ryanhendo+pp-acme-activeclient@gmail.com',
        userid: '123456',
        connectionid: '123456',
        subscriptionid: '123456'
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 401 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(401);
  });
});
