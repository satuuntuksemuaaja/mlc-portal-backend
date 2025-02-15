import { Context } from '@azure/functions';
import httpTrigger from '../../api-admin-agentclient/index';
import { TestData } from '../data/testdata';
import { AgentClientRepository } from '../../src/repository/agentclient.repository';
import { AgentClientResponse } from '../../src/interface/response/agentclient.response.interface';
import { AgentRepository } from '../../src/repository/agent.repository';
import { TestHelper } from '../data/testhelper';

import { ClientStatus } from '../../src/model/enums/client.enum';
import { AgentStatus } from '../../src/model/enums/agent.enum';
import { CreateAgentResponse } from '../../src/interface/response/agent.response.interface';
import { UserClientResponse } from '../../src/interface/response/client.response.interface';
import { CreateClientController } from '../../src/controller/client/create.client.controller';
import { MeecoInvitationService } from '../../src/service/meeco.invitation.service';
import { BffInvitationService } from '../../src/service/invitation/invitation.bff.service';

jest.mock('../../src/service/meeco.invitation.service');
jest.mock('../../src/service/invitation/invitation.bff.service');

describe('Test to to delete agent client', () => {
  let context: Context;
  let agent: CreateAgentResponse;
  let client: UserClientResponse;
  let agentclient: Promise<AgentClientResponse>;
  jest.setTimeout(60000);
  beforeAll(async () => {
    context = { log: jest.fn() } as unknown as Context;

    // create a new agent
    agent = await AgentRepository.adminCreateAgent(
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
    /**
     * Create a new client
     */
    agentclient = AgentClientRepository.adminCreateAgentClient({
      clientId: client.id,
      agentId: agent.id
    });

    return { agent, client, agentclient };
  });

  it('Valid Admin agent should be able to delete agent client - Http status code: 200', async () => {
    const newAgent = agent;
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ACTIVE);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');

    const newClient = client;
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Account');

    const newAgentClient = await Promise.resolve(agentclient);
    expect(newAgentClient).toBeDefined();
    expect(newAgentClient.agentId.toString()).toBe(agent.id.toString());
    expect(newAgentClient.clientId.toString()).toBe(client.id.toString());

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'DELETE',
      url: '',
      query: {},
      params: {
        clientId: newAgentClient.clientId.toString(),
        agentId: newAgentClient.agentId.toString()
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
  });

  it('User level agent should fail to delete agent client', async () => {
    const newAgent = agent;
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ACTIVE);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');

    const newClient = client;
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Account');

    const newAgentClient = await Promise.resolve(agentclient);
    expect(newAgentClient).toBeDefined();
    expect(newAgentClient.agentId.toString()).toBe(agent.id.toString());
    expect(newAgentClient.clientId.toString()).toBe(client.id.toString());

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getUserAgent()
      },
      method: 'DELETE',
      url: '',
      query: {},
      params: {
        clientId: newAgentClient.clientId.toString(),
        agentId: newAgentClient.agentId.toString()
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('Archived Admin Agent Should Fail to delete agent client', async () => {
    const newAgent = agent;
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ACTIVE);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');

    const newClient = client;
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Account');

    const newAgentClient = await Promise.resolve(agentclient);
    expect(newAgentClient).toBeDefined();
    expect(newAgentClient.agentId.toString()).toBe(agent.id.toString());
    expect(newAgentClient.clientId.toString()).toBe(client.id.toString());

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedAdminAgent()
      },
      method: 'DELETE',
      url: '',
      query: {},
      params: {
        clientId: newAgentClient.clientId.toString(),
        agentId: newAgentClient.agentId.toString()
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('Archived user agent should fail to delete agent client', async () => {
    const newAgent = agent;
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ACTIVE);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');

    const newClient = client;
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Account');

    const newAgentClient = await Promise.resolve(agentclient);
    expect(newAgentClient).toBeDefined();
    expect(newAgentClient.agentId.toString()).toBe(agent.id.toString());
    expect(newAgentClient.clientId.toString()).toBe(client.id.toString());

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedUserAgent()
      },
      method: 'DELETE',
      url: '',
      query: {},
      params: {
        clientId: newAgentClient.clientId.toString(),
        agentId: newAgentClient.agentId.toString()
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('Non Registered (In DB) agent should fail to delete agent client', async () => {
    const newAgent = agent;
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ACTIVE);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');

    const newClient = client;
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Account');

    const newAgentClient = await Promise.resolve(agentclient);
    expect(newAgentClient).toBeDefined();
    expect(newAgentClient.agentId.toString()).toBe(agent.id.toString());
    expect(newAgentClient.clientId.toString()).toBe(client.id.toString());

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getNonConfiguredAgent()
      },
      method: 'DELETE',
      url: '',
      query: {},
      params: {
        clientId: newAgentClient.clientId.toString(),
        agentId: newAgentClient.agentId.toString()
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });

  it('Valid Admin agent should not be able to delete agent client if client have only one relation.', async () => {
    const newAgent = agent;
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ACTIVE);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');

    const newClient = client;
    expect(newClient).toBeDefined();
    expect(newClient.status).toBe(ClientStatus.PENDING);
    expect(newClient.ref).toBe('Abc123');
    expect(newClient.notes).toBe('customer notes');
    expect(newClient?.phone).toBe('0289866544');
    expect(newClient.name).toBe('Test Account');

    const newAgentClient = await Promise.resolve(agentclient);
    expect(newAgentClient).toBeDefined();
    expect(newAgentClient.agentId.toString()).toBe(agent.id.toString());
    expect(newAgentClient.clientId.toString()).toBe(client.id.toString());

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'DELETE',
      url: '',
      query: {},
      params: {
        clientId: newAgentClient.clientId.toString(),
        agentId: '353f8c6a-551e-11ed-bdc3-0242ac120002'
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 400 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(400);
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
    expect(newClient.name).toBe('Test Account');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'DELETE',
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
    expect(newClient.name).toBe('Test Account');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminPlutoAgent()
      },
      method: 'DELETE',
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
    context.req = {
      headers: {
        authorization: ''
      },
      method: 'DELETE',
      url: '',
      query: {},
      params: {
        clientId: '12132',
        agentId: '324'
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });
});
