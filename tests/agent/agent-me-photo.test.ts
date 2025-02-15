import { Context } from '@azure/functions';
import httpTrigger from '../../api-agent-me-photo/index';
import { TestData } from '../data/testdata';

describe('Test to get agent me photo', () => {
  let context: Context;

  beforeAll(() => {
    jest.setTimeout(60000);
    context = { log: jest.fn() } as unknown as Context;
  });

  it('Valid Admin agent should be able to get their photo - Http status code: 200', async () => {
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
    expect(context?.res?.statusCode).toEqual(200);
  });

  it('Valid User agent should be able to get their photo - Http status code: 200', async () => {
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
    expect(context?.res?.statusCode).toEqual(200);
  });

  it('Archived admin agent should be able to get their photo - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedAdminAgent()
      },
      method: 'GET',
      url: '',
      query: {},
      params: {}
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
  });

  it('Archived admin agent should be able to get their photo - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedUserAgent()
      },
      method: 'GET',
      url: '',
      query: {},
      params: {}
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
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
