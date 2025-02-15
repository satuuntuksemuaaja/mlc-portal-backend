import { Context } from '@azure/functions';
import { TestData } from '../data/testdata';
import httpTrigger from '../../api-read-all-message-by-clientid/index';
import { CreateClientController } from '../../src/controller/client/create.client.controller';
import { BffInvitationService } from '../../src/service/invitation/invitation.bff.service';
import { MeecoInvitationService } from '../../src/service/meeco.invitation.service';
import { ClientStatus } from '../../src/model/enums/client.enum';
import { UserClientResponse } from '../../src/interface/response/client.response.interface';
import { UnreadmessageRepository } from '../../src/repository/unreadmessage.repository';
import { TestHelper } from '../data/testhelper';

jest.mock('../../src/service/meeco.invitation.service');
jest.mock('../../src/service/invitation/invitation.bff.service');

describe('Test to archive client', () => {
  let context: Context;
  let client: UserClientResponse;
  let unreadmessage;

  jest.setTimeout(10010);
  beforeAll(async () => {
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
    client = await new CreateClientController(context).run();
    unreadmessage = await UnreadmessageRepository.createUnreadMessages([
      {
        messageId: '123',
        clientId: client?.id,
        agentId: '353f8c6a-551e-11ed-bdc3-0242ac120002',
        orgId: 'cd0bcea6-551d-11ed-bdc3-0242ac120002'
      }
    ]);
  });

  it('Valid Admin agent should be able to put message as read - Http status code: 200', async () => {
    const newClient = client;
    expect(newClient).toBeDefined();
    expect(newClient?.status).toBe(ClientStatus.PENDING);
    expect(newClient?.ref).toBe('Abc123');
    expect(newClient?.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient?.name).toBe('Test Account');

    const newUnreadMessage = unreadmessage;
    expect(newUnreadMessage[0]).toBeDefined();
    expect(newUnreadMessage[0]?.messageId).toBe('123');
    expect(newUnreadMessage[0]?.clientId).toBe(newClient?.id);
    expect(newUnreadMessage[0]?.agentId).toBe(
      '353f8c6a-551e-11ed-bdc3-0242ac120002'
    );
    expect(newUnreadMessage[0]?.orgId).toBe(
      'cd0bcea6-551d-11ed-bdc3-0242ac120002'
    );

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: newClient?.id
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
  });

  it('User level agent should be able to put message as read', async () => {
    const newClient = client;
    expect(newClient).toBeDefined();
    expect(newClient?.status).toBe(ClientStatus.PENDING);
    expect(newClient?.ref).toBe('Abc123');
    expect(newClient?.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient?.name).toBe('Test Account');

    const newUnreadMessage = unreadmessage;
    expect(newUnreadMessage[0]).toBeDefined();
    expect(newUnreadMessage[0]?.messageId).toBe('123');
    expect(newUnreadMessage[0]?.clientId).toBe(newClient?.id);
    expect(newUnreadMessage[0]?.agentId).toBe(
      '353f8c6a-551e-11ed-bdc3-0242ac120002'
    );
    expect(newUnreadMessage[0]?.orgId).toBe(
      'cd0bcea6-551d-11ed-bdc3-0242ac120002'
    );

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getUserAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: newClient?.id
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
  });

  it('Archived Admin Agent Should Fail', async () => {
    const newClient = client;
    expect(newClient).toBeDefined();
    expect(newClient?.status).toBe(ClientStatus.PENDING);
    expect(newClient?.ref).toBe('Abc123');
    expect(newClient?.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient?.name).toBe('Test Account');

    const newUnreadMessage = unreadmessage;
    expect(newUnreadMessage[0]).toBeDefined();
    expect(newUnreadMessage[0]?.messageId).toBe('123');
    expect(newUnreadMessage[0]?.clientId).toBe(newClient?.id);
    expect(newUnreadMessage[0]?.agentId).toBe(
      '353f8c6a-551e-11ed-bdc3-0242ac120002'
    );
    expect(newUnreadMessage[0]?.orgId).toBe(
      'cd0bcea6-551d-11ed-bdc3-0242ac120002'
    );

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: newClient?.id
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('Archived user agent should fail', async () => {
    const newClient = client;
    expect(newClient).toBeDefined();
    expect(newClient?.status).toBe(ClientStatus.PENDING);
    expect(newClient?.ref).toBe('Abc123');
    expect(newClient?.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient?.name).toBe('Test Account');

    const newUnreadMessage = unreadmessage;
    expect(newUnreadMessage[0]).toBeDefined();
    expect(newUnreadMessage[0]?.messageId).toBe('123');
    expect(newUnreadMessage[0]?.clientId).toBe(newClient?.id);
    expect(newUnreadMessage[0]?.agentId).toBe(
      '353f8c6a-551e-11ed-bdc3-0242ac120002'
    );
    expect(newUnreadMessage[0]?.orgId).toBe(
      'cd0bcea6-551d-11ed-bdc3-0242ac120002'
    );

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedUserAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: newClient?.id
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('Non Registered (In DB) agent should fail', async () => {
    const newClient = client;
    expect(newClient).toBeDefined();
    expect(newClient?.status).toBe(ClientStatus.PENDING);
    expect(newClient?.ref).toBe('Abc123');
    expect(newClient?.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient?.name).toBe('Test Account');

    const newUnreadMessage = unreadmessage;
    expect(newUnreadMessage[0]).toBeDefined();
    expect(newUnreadMessage[0]?.messageId).toBe('123');
    expect(newUnreadMessage[0]?.clientId).toBe(newClient?.id);
    expect(newUnreadMessage[0]?.agentId).toBe(
      '353f8c6a-551e-11ed-bdc3-0242ac120002'
    );
    expect(newUnreadMessage[0]?.orgId).toBe(
      'cd0bcea6-551d-11ed-bdc3-0242ac120002'
    );

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getNonConfiguredAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: newClient?.id
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });

  it('Valid admin agent should fail with status code 500', async () => {
    const newClient = client;
    expect(newClient).toBeDefined();
    expect(newClient?.status).toBe(ClientStatus.PENDING);
    expect(newClient?.ref).toBe('Abc123');
    expect(newClient?.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient?.name).toBe('Test Account');

    const newUnreadMessage = unreadmessage;
    expect(newUnreadMessage[0]).toBeDefined();
    expect(newUnreadMessage[0]?.messageId).toBe('123');
    expect(newUnreadMessage[0]?.clientId).toBe(newClient?.id);
    expect(newUnreadMessage[0]?.agentId).toBe(
      '353f8c6a-551e-11ed-bdc3-0242ac120002'
    );
    expect(newUnreadMessage[0]?.orgId).toBe(
      'cd0bcea6-551d-11ed-bdc3-0242ac120002'
    );

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

  it('Valid admin agent should fail with status code 400 for invalid request', async () => {
    const newClient = client;
    expect(newClient).toBeDefined();
    expect(newClient?.status).toBe(ClientStatus.PENDING);
    expect(newClient?.ref).toBe('Abc123');
    expect(newClient?.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient?.name).toBe('Test Account');

    const newUnreadMessage = unreadmessage;
    expect(newUnreadMessage[0]).toBeDefined();
    expect(newUnreadMessage[0]?.messageId).toBe('123');
    expect(newUnreadMessage[0]?.clientId).toBe(newClient?.id);
    expect(newUnreadMessage[0]?.agentId).toBe(
      '353f8c6a-551e-11ed-bdc3-0242ac120002'
    );
    expect(newUnreadMessage[0]?.orgId).toBe(
      'cd0bcea6-551d-11ed-bdc3-0242ac120002'
    );

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: 'newClient.id'
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
