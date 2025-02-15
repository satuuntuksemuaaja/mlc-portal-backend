import { Context } from '@azure/functions';
import httpTrigger from '../../api-admin-agent/index';
import { TestData } from '../data/testdata';
import { TestHelper } from '../data/testhelper';

describe('Test to create agent', () => {
  let context: Context;

  beforeAll(() => {
    jest.setTimeout(60000);
    context = { log: jest.fn() } as unknown as Context;
  });

  it('should return a 200 with the created agent data', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'POST',
      url: '',
      query: {},
      params: {},
      body: {
        name: 'Acme Admin agent1',
        roleId: 1002,
        emailPrefix: TestHelper.makeid(30),
        phone: '0289866544'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.agent?.roleId).toEqual('1002');
    expect(context?.res?.body?.agent?.name).toEqual('Acme Admin agent1');
    expect(context?.res?.body?.agent?.phone).toEqual('0289866544');
  });

  it('User level agent should fail', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getUserAgent()
      },
      method: 'POST',
      url: '',
      query: {},
      params: {},
      body: {
        name: 'Acme Admin agent1',
        roleId: 1002,
        emailPrefix: TestHelper.makeid(30),
        phone: '0289866544'
      }
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
      method: 'POST',
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
      method: 'POST',
      url: '',
      query: {},
      params: {}
    };
    await httpTrigger(context);
    console.log('Fail with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('should return a 409 for duplicate agent', async () => {
    const emailPrefix = TestHelper.makeid(30);

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'POST',
      url: '',
      query: {},
      params: {},
      body: {
        name: 'Acme Admin agent1',
        roleId: 1002,
        emailPrefix: emailPrefix,
        phone: '0289866544'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.agent?.roleId).toEqual('1002');
    expect(context?.res?.body?.agent?.name).toEqual('Acme Admin agent1');

    // duplicate request should fail
    await httpTrigger(context);
    console.log('Success with status code 409 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(409);
  });

  it('should return a 500 with blank body', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'POST',
      url: '',
      query: {},
      params: {}
    };
    await httpTrigger(context);
    console.log('create agent should return 500 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(500);
  });

  it('Valid Admin agent should not be able to cereate agent with wrong method.', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'GET',
      url: '',
      query: {},
      params: {},
      body: {
        name: 'Acme Admin agent1',
        roleId: 1002,
        emailPrefix: TestHelper.makeid(30),
        phone: '0123456789'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 500 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(500);
  });

  it('Valid Admin agent should fail with status code 500', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'POST',
      url: '',
      query: {},
      params: {},
      body: {
        name: 'Acme Admin agent1',
        roleId: 12,
        emailPrefix: TestHelper.makeid(30),
        phone: '0289866544'
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
      method: 'POST',
      url: '',
      query: {},
      params: {},
      body: {
        name: 'A',
        roleId: '1002',
        emailPrefix: TestHelper.makeid(2),
        phone: '972345678902'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 400 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(400);
  });

  it('Invalid header token', async () => {
    context.req = {
      headers: {
        authorization: ''
      },
      method: 'POST',
      url: '',
      query: {},
      params: {},
      body: {
        name: 'Acme Admin agent1',
        roleId: 1002,
        emailPrefix: TestHelper.makeid(30),
        phone: '0289866544'
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });
});
