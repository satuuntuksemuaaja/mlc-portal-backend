import { Context } from '@azure/functions';
import { TestData } from '../data/testdata';
import { ClientStatus } from '../../src/model/enums/client.enum';
import httpTrigger from '../../api-client-achived-update/index';
import { TestHelper } from '../data/testhelper';
import { UserClientResponse } from '../../src/interface/response/client.response.interface';
import { CreateClientController } from '../../src/controller/client/create.client.controller';
import { MeecoInvitationService } from '../../src/service/meeco.invitation.service';
import { BffInvitationService } from '../../src/service/invitation/invitation.bff.service';

jest.mock('../../src/service/meeco.invitation.service');
jest.mock('../../src/service/invitation/invitation.bff.service');

describe('Test to archive client', () => {
  let context: Context;
  let client: Promise<UserClientResponse>;

  beforeAll(() => {
    jest.setTimeout(60000);
    context = { log: jest.fn() } as unknown as Context;

    /**
     * Create a new client
     */
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'POST',
      url: '',
      query: {},
      params: {},
      body: {
        name: 'Test Account',
        email: TestHelper.makeid(30) + '@gmail.com',
        ref: 'Abc123',
        notes: 'customer notes',
        phone: '0289866544'
      }
    };
    (MeecoInvitationService.prototype.invite as jest.Mock).mockReturnValue(
      true
    );
    (BffInvitationService.prototype.share as jest.Mock).mockReturnValue(true);
    (MeecoInvitationService.prototype.delete as jest.Mock).mockReturnValue(
      true
    );
    (BffInvitationService.prototype.delete as jest.Mock).mockReturnValue(true);
    client = new CreateClientController(context).run();
  });

  it('Valid Admin agent should be able to archive client - Http status code: 200', async () => {
    const newClient = await Promise.resolve(await client);
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Account');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        id: newClient.id
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body).toBeDefined();
    expect(context?.res?.body.id).toBe(newClient.id);
    expect(context?.res?.body.status).toBe(ClientStatus.ARCHIVED);
    expect(context?.res?.body?.name).toEqual('Test Account');
  });

  it('User level agent should be able to archive client', async () => {
    const newClient = await Promise.resolve(await client);
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Account');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getUserAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        id: newClient.id
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body).toBeDefined();
    expect(context?.res?.body.id).toBe(newClient.id);
    expect(context?.res?.body.status).toBe(ClientStatus.ARCHIVED);
    expect(context?.res?.body?.name).toEqual('Test Account');
  });

  it('Archived Admin Agent Should Fail to archive client', async () => {
    const newClient = await Promise.resolve(await client);
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Account');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        id: newClient.id
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('Archived user agent should fail to archive client', async () => {
    const newClient = await Promise.resolve(await client);
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Account');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedUserAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        id: newClient.id
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('Non Registered (In DB) agent should fail to archive client', async () => {
    const newClient = await Promise.resolve(await client);
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Account');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getNonConfiguredAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        id: newClient.id
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });

  it('Valid Admin agent should be not able to archive client from other organisation', async () => {
    const newClient = await Promise.resolve(await client);
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Account');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminPlutoAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        id: newClient.id
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('User level agent should be not able to archive client from other organisation', async () => {
    const newClient = await Promise.resolve(await client);
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Account');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getUserPlutoAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        id: newClient.id
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('Valid Admin agent should fail with status code 500', async () => {
    const newClient = await Promise.resolve(await client);
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Account');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {}
    };
    await httpTrigger(context);
    console.log('Success with status code 500 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(500);
  });
  it('Valid Admin agent should fail with status code 400 for invalid request', async () => {
    const newClient = await Promise.resolve(await client);
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Account');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminPlutoAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        id: '1234'
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
