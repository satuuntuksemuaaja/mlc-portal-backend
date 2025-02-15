import { Context } from '@azure/functions';
import httpTrigger from '../../api-agent-me/index';
import { BffOrganisationService } from '../../src/service/organisation/organisation.bff.service';
import { TestData } from '../data/testdata';

jest.mock('../../src/service/organisation/organisation.bff.service');

describe('Test to get agent me', () => {
  let context: Context;
  beforeAll(() => {
    jest.setTimeout(60000);
    context = { log: jest.fn() } as unknown as Context;
  });
  it('Valid Admin agent should be able to get their details - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'GET',
      url: '',
      query: {},
      params: {}
    };
    (BffOrganisationService.prototype.create as jest.Mock).mockReturnValue({
      ok: true
    });
    (BffOrganisationService.prototype.update as jest.Mock).mockReturnValue({
      ok: true
    });
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
  });

  it('Valid User agent should be able to get their details - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getUserAgent()
      },
      method: 'GET',
      url: '',
      query: {},
      params: {}
    };
    (BffOrganisationService.prototype.create as jest.Mock).mockReturnValue({
      ok: true
    });
    (BffOrganisationService.prototype.update as jest.Mock).mockReturnValue({
      ok: true
    });
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
  });

  it('Archived admin agent should be able to get their details - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedAdminAgent()
      },
      method: 'GET',
      url: '',
      query: {},
      params: {}
    };
    (BffOrganisationService.prototype.create as jest.Mock).mockReturnValue({
      ok: true
    });
    (BffOrganisationService.prototype.update as jest.Mock).mockReturnValue({
      ok: true
    });
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
  });

  it('Archived admin agent should be able to get their details - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedUserAgent()
      },
      method: 'GET',
      url: '',
      query: {},
      params: {}
    };
    (BffOrganisationService.prototype.create as jest.Mock).mockReturnValue({
      ok: true
    });
    (BffOrganisationService.prototype.update as jest.Mock).mockReturnValue({
      ok: true
    });
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
  });

  it('Valid Admin agent should still be able to get their details if bff stub fails', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminPlutoAgent()
      },
      method: 'GET',
      url: '',
      query: {},
      params: {}
    };
    (BffOrganisationService.prototype.create as jest.Mock).mockReturnValue({
      ok: true
    });
    (BffOrganisationService.prototype.update as jest.Mock).mockReturnValue({
      ok: null
    });
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
  });

  it('Valid Admin agent should not be able to cereate agent with wrong method.', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'DELETE',
      url: '',
      query: {},
      params: {}
    };
    await httpTrigger(context);
    console.log('Success with status code 500 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(500);
  });

  it('Invalid header token', async () => {
    context.req = {
      headers: {
        authorization: ''
      },
      method: 'GET',
      url: '',
      query: {},
      params: {}
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });
});
