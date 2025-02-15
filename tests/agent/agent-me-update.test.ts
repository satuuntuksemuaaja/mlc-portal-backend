import { Context } from '@azure/functions';
import httpTrigger from '../../api-agent-me/index';
import { TestData } from '../data/testdata';

describe('Test to agent me update', () => {
  let context: Context;

  beforeAll(() => {
    jest.setTimeout(60000);
    context = { log: jest.fn() } as unknown as Context;
  });

  it('Valid Admin agent should be able to update their details - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'PUT',
      url: '',
      query: {},
      params: {},
      body: {
        name: 'Acme Admin agent update',
        phone: '0289866544'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.me?.name).toEqual('Acme Admin agent update');
    expect(context?.res?.body?.me?.phone).toEqual('0289866544');
  });

  it('Valid User agent should be able to update their details - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getUserAgent()
      },
      method: 'PUT',
      url: '',
      query: {},
      params: {},
      body: {
        name: 'Acme User agent update',
        phone: '0289866544'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.me?.name).toEqual('Acme User agent update');
    expect(context?.res?.body?.me?.phone).toEqual('0289866544');
  });

  it('Archived admin agent should be able to update their details - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedAdminAgent()
      },
      method: 'PUT',
      url: '',
      query: {},
      params: {},
      body: {
        name: 'Archived Acme Admin update',
        phone: '0289866544'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.me?.name).toEqual('Archived Acme Admin update');
  });

  it('Archived admin agent should be able to update their details', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedUserAgent()
      },
      method: 'PUT',
      url: '',
      query: {},
      params: {},
      body: {
        name: 'Archived Acme User update',
        phone: '0289866544'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.me?.name).toEqual('Archived Acme User update');
  });

  it('Valid Admin agent should not be able to update their details with wrong method.', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'DELETE',
      url: '',
      query: {},
      params: {},
      body: {
        name: 'Acme Admin agent update',
        phone: '0289866544'
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
      method: 'PUT',
      url: '',
      query: {},
      params: {}
    };
    await httpTrigger(context);
    console.log('Success with status code 500 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(500);
  });
  it('Valid Admin agent should fail with status code 400 for invalid request', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminPlutoAgent()
      },
      method: 'PUT',
      url: '',
      query: {},
      params: {},
      body: {
        name: 'A',
        phone: '02898664'
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
      method: 'PUT',
      url: '',
      query: {},
      params: {},
      body: {
        name: 'Acme Admin agent update',
        phone: '0289866544'
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });
});
