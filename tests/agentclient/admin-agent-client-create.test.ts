import { Context } from '@azure/functions';
import httpTrigger from '../../api-admin-agentclient/index';
import { AgentResponse } from '../../src/interface/response/agent.response.interface';
import { AgentStatus } from '../../src/model/enums/agent.enum';
import { ClientStatus } from '../../src/model/enums/client.enum';
import { AgentRepository } from '../../src/repository/agent.repository';
import { TestData } from '../data/testdata';
import { TestHelper } from '../data/testhelper';
import { CreateClientController } from '../../src/controller/client/create.client.controller';
import { UserClientResponse } from '../../src/interface/response/client.response.interface';
import { MeecoInvitationService } from '../../src/service/meeco.invitation.service';
import { BffInvitationService } from '../../src/service/invitation/invitation.bff.service';

jest.mock('../../src/service/meeco.invitation.service');
jest.mock('../../src/service/invitation/invitation.bff.service');

describe('Test to agent list', () => {
  let context: Context;
  let agent: Promise<AgentResponse>;
  let client: Promise<UserClientResponse>;
  jest.setTimeout(60000);
  beforeAll(() => {
    context = { log: jest.fn() } as unknown as Context;

    // create a new agent
    agent = AgentRepository.adminCreateAgent(
      {
        orgId: 'cd0bcea6-551d-11ed-bdc3-0242ac120002',
        id: '353f8c6a-551e-11ed-bdc3-0242ac120002'
      },
      {
        name: 'Acme Admin agent1',
        roleId: '1001',
        emailPrefix: TestHelper.makeid(30),
        phone: '0123456789'
      }
    );

    // create a new client
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'POST',
      url: '',
      query: {},
      params: {},
      body: {
        name: 'Test Agent Client Account',
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
    return { agent, client };
  });

  it('Valid Admin agent should be able to add agent client - Http status code: 200', async () => {
    const newAgent = await Promise.resolve(agent);
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ACTIVE);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');
    expect(newAgent.phone).toBe('0123456789');

    const newClient = await Promise.resolve(await client);
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Agent Client Account');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'POST',
      url: '',
      query: {},
      params: {
        clientId: newClient.id,
        agentId: newAgent.id
      },
      body: {}
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
  });

  it('Valid Admin agent should fail to add agent client already associated', async () => {
    const newAgent = await Promise.resolve(agent);
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ACTIVE);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');
    expect(newAgent.phone).toBe('0123456789');

    const newClient = await Promise.resolve(await client);
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Agent Client Account');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'POST',
      url: '',
      query: {},
      params: {
        clientId: newClient.id,
        agentId: newAgent.id
      },
      body: {}
    };
    await httpTrigger(context);
    console.log('Success with status code 409 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(409);
  });

  it('User level agent should fail to add agent client', async () => {
    const newAgent = await Promise.resolve(agent);
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ACTIVE);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');

    const newClient = await Promise.resolve(await client);
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Agent Client Account');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getUserAgent()
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

  it('Archived admin agent should fail to add agent client', async () => {
    const newAgent = await Promise.resolve(agent);
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ACTIVE);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');

    const newClient = await Promise.resolve(await client);
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Agent Client Account');

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

  it('Archived user agent should fail to add agent client', async () => {
    const newAgent = await Promise.resolve(agent);
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ACTIVE);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');

    const newClient = await Promise.resolve(await client);
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Agent Client Account');

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

  it('Non Registered (In DB) agent should fail to add agent client', async () => {
    const newAgent = await Promise.resolve(agent);
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ACTIVE);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');

    const newClient = await Promise.resolve(await client);
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Agent Client Account');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getNonConfiguredAgent()
      },
      method: 'POST',
      url: '',
      query: {},
      params: {}
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });

  it('Valid Admin agent should not be able to create agent client with wrong method.', async () => {
    const newAgent = await Promise.resolve(agent);
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ACTIVE);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');
    expect(newAgent.phone).toBe('0123456789');

    const newClient = await Promise.resolve(await client);
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Agent Client Account');
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'PUT',
      url: '',
      query: {},
      params: {
        clientId: newClient.id,
        agentId: newAgent.id
      },
      body: {}
    };
    await httpTrigger(context);
    console.log('Success with status code 500 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(500);
  });

  it('Valid Admin agent should fail with status code 500', async () => {
    const newAgent = await Promise.resolve(agent);
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ACTIVE);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');
    expect(newAgent.phone).toBe('0123456789');

    const newClient = await Promise.resolve(await client);
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Agent Client Account');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'POST',
      url: '',
      query: {},
      body: {}
    };
    await httpTrigger(context);
    console.log('Success with status code 500 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(500);
  });

  it('Valid Admin agent should fail with status code 400 for invalid request', async () => {
    const newAgent = await Promise.resolve(agent);
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ACTIVE);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');
    expect(newAgent.phone).toBe('0123456789');

    const newClient = await Promise.resolve(await client);
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Agent Client Account');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminPlutoAgent()
      },
      method: 'POST',
      url: '',
      query: {},
      params: {
        clientId: '12132',
        agentId: '324'
      },
      body: {}
    };
    await httpTrigger(context);
    console.log('Success with status code 400 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(400);
  });

  it('Invalid header token', async () => {
    const newAgent = await Promise.resolve(agent);
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ACTIVE);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');
    expect(newAgent.phone).toBe('0123456789');

    const newClient = await Promise.resolve(await client);
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Agent Client Account');

    context.req = {
      headers: {
        authorization: ''
      },
      method: 'POST',
      url: '',
      query: {},
      params: {
        clientId: newClient.id,
        agentId: newAgent.id
      },
      body: {}
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });
});
