import { Context } from '@azure/functions';
import { TestData } from '../data/testdata';
import httpTrigger from '../../api-client/index';
import { ClientStatus } from '../../src/model/enums/client.enum';
import { TestHelper } from '../data/testhelper';
import { MeecoInvitationService } from '../../src/service/meeco.invitation.service';
import { BffInvitationService } from '../../src/service/invitation/invitation.bff.service';

jest.mock('../../src/service/meeco.invitation.service');
jest.mock('../../src/service/invitation/invitation.bff.service');

describe('Test to create client', () => {
  let context: Context;
  jest.setTimeout(20000);
  beforeAll(() => {
    context = { log: jest.fn() } as unknown as Context;
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Valid Admin agent should be able to create client - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'POST',
      url: '',
      query: {},
      params: {},
      body: {
        name: 'Test client',
        ref: 'test123',
        notes: 'test notes',
        email: TestHelper.makeid(30) + '@gmail.com',
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
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.name).toEqual('Test client');
    expect(context?.res?.body?.ref).toEqual('test123');
    expect(context?.res?.body?.status).toEqual(ClientStatus.PENDING);
    expect(context?.res?.body?.notes).toEqual('test notes');
    expect(context?.res?.body?.phone).toEqual('0289866544');
  });

  it('User level agent should able to create client.', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getUserAgent()
      },
      method: 'POST',
      url: '',
      query: {},
      params: {},
      body: {
        name: 'Test client',
        ref: 'test123',
        notes: 'test notes',
        email: TestHelper.makeid(30) + '@gmail.com',
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
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.name).toEqual('Test client');
    expect(context?.res?.body?.ref).toEqual('test123');
    expect(context?.res?.body?.status).toEqual(ClientStatus.PENDING);
    expect(context?.res?.body?.notes).toEqual('test notes');
    expect(context?.res?.body?.phone).toEqual('0289866544');
  });

  it('Archived admin agent should fail to create client.', async () => {
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

  it('Archived user agent should fail to create client.', async () => {
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

  it('should return a 409 for duplicate client', async () => {
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
        name: 'Test client',
        ref: 'test123',
        notes: 'test notes',
        email: emailPrefix + '@gmail.com',
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
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.name).toEqual('Test client');
    expect(context?.res?.body?.ref).toEqual('test123');
    expect(context?.res?.body?.status).toEqual(ClientStatus.PENDING);
    expect(context?.res?.body?.notes).toEqual('test notes');
    context.req.body = {
      name: 'Test client',
      ref: 'test123',
      notes: 'test notes',
      email: emailPrefix + '@gmail.com',
      phone: '0289866544'
    };
    // duplicate request should fail
    await httpTrigger(context);
    console.log('Success with status code 409 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(409);
  });

  it('should return a 500 with blank body.', async () => {
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

  it('Valid Admin agent should not be able to create client as meeco stub fails', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'POST',
      url: '',
      query: {},
      params: {},
      body: {
        name: 'Test client',
        ref: 'test123',
        notes: 'test notes',
        email: TestHelper.makeid(30) + '@gmail.com',
        phone: '0289866544'
      }
    };
    (MeecoInvitationService.prototype.invite as jest.Mock).mockReturnValue(
      null
    );
    (MeecoInvitationService.prototype.delete as jest.Mock).mockReturnValue(
      true
    );
    await httpTrigger(context);
    console.log('Success with status code 500 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(500);
  });

  it('Valid Admin agent should not be able to create client as bff stub fails', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'POST',
      url: '',
      query: {},
      params: {},
      body: {
        name: 'Test client',
        ref: 'test123',
        notes: 'test notes',
        email: TestHelper.makeid(30) + '@gmail.com',
        phone: '0289866544'
      }
    };
    (MeecoInvitationService.prototype.invite as jest.Mock).mockReturnValue(
      true
    );
    (BffInvitationService.prototype.share as jest.Mock).mockReturnValue(null);
    (MeecoInvitationService.prototype.delete as jest.Mock).mockReturnValue(
      true
    );
    (BffInvitationService.prototype.delete as jest.Mock).mockReturnValue(true);
    await httpTrigger(context);
    console.log('Success with status code 500 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(500);
  });

  it('Valid Admin agent should not be able to cereate client with wrong method.', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'DELETE',
      url: '',
      query: {},
      params: {},
      body: {
        name: 'Test client',
        ref: 'test123',
        notes: 'test notes',
        email: TestHelper.makeid(30) + '@gmail.com',
        phone: '0289866544'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 500 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(500);
  });

  it('Valid Admin agent should fail with status code 500.', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'POST',
      url: '',
      query: {},
      params: {},
      body: {
        name: 'Test client',
        ref: 'test123',
        notes: 'test notes',
        email: TestHelper.makeid(30) + '@gmail.com',
        phone: '0289866544'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 500 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(500);
  });

  it('Valid Admin agent should fail with status code 400 for invaild request.', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'POST',
      url: '',
      query: {},
      params: {},
      body: {
        name: 'T',
        ref: 't',
        notes: 't',
        email: TestHelper.makeid(30) + '@gmail.co',
        phone: '01234567892'
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
    await httpTrigger(context);
    console.log('Fail with status code 400 - ', context?.res?.statusCode);
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
        name: 'Test client',
        ref: 'test123',
        notes: 'test notes',
        email: TestHelper.makeid(30) + '@gmail.com',
        phone: '0289866544'
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });
});
