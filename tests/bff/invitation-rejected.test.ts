import { Context } from '@azure/functions';
import httpTrigger from '../../api-bff-invitation-rejected/index';

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
      params: {
        org: 'acme',
        invitationId: 'd0fd5d9d-44e6-438a-b376-7ac563994ba1'
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
      params: {
        org: 'acme',
        invitationId: '87e0ec6d-f6b1-490d-80e3-28225aec32de'
      },
      body: {}
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(401);
  });

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
        email: 'ryanhendo+pp-acme-activeclient@gmail.yaho'
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
        email: 'ryanhendo+pp-acme-archivedclient@gmail.com'
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 401 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(401);
  });
});
