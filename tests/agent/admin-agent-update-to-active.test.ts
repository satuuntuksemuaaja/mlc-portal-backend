import { Context } from '@azure/functions';
import { TestData } from '../data/testdata';
import { TestHelper } from '../data/testhelper';
import httpTrigger from '../../api-admin-agent-update-to-active/index';
import { AgentRepository } from '../../src/repository/agent.repository';
import { AgentResponse } from '../../src/interface/response/agent.response.interface';
import { AgentStatus } from '../../src/model/enums/agent.enum';

describe('Test to update agent to active', () => {
  let context: Context;
  let agent: AgentResponse;
  let updatedAgent: Promise<AgentResponse>;

  beforeAll(async () => {
    jest.setTimeout(60000);
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
    // Update agent.
    return (updatedAgent = AgentRepository.adminArchiveAgent(
      {
        orgId: 'cd0bcea6-551d-11ed-bdc3-0242ac120002',
        id: '353f8c6a-551e-11ed-bdc3-0242ac120002'
      },
      agent.id
    ));
  });

  it('Valid Admin agent can activate agent', async () => {
    const newAgent = await Promise.resolve(updatedAgent);
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ARCHIVED);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');
    expect(newAgent.phone).toBe('0123456789');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {},
      body: {
        id: newAgent.id
      }
    };

    await httpTrigger(context);

    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body.agent).toBeDefined();
    expect(context?.res?.body.agent.id).toBe(newAgent.id);
    expect(context?.res?.body.agent.status).toBe(AgentStatus.ACTIVE);
  });

  it('User level agent should fail', async () => {
    const newAgent = await Promise.resolve(updatedAgent);
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ARCHIVED);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getUserAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {},
      body: {
        id: newAgent.id
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('Archived admin agent should fail', async () => {
    const newAgent = await Promise.resolve(updatedAgent);
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ARCHIVED);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {},
      body: {
        id: newAgent.id
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('Archived user agent should fail', async () => {
    const newAgent = await Promise.resolve(updatedAgent);
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ARCHIVED);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedUserAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {},
      body: {
        id: newAgent.id
      }
    };

    await httpTrigger(context);
    console.log('Fail with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('Non Registered (In DB) agent should fail', async () => {
    const newAgent = await Promise.resolve(updatedAgent);
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ARCHIVED);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getNonConfiguredAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {},
      body: {
        id: newAgent.id
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });

  it('Valid Admin agent should not be able to restore agent from other organisation', async () => {
    const newAgent = await Promise.resolve(updatedAgent);
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ARCHIVED);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminPlutoAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {},
      body: {
        id: newAgent.id
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('Valid Admin agent should fail with status code 500', async () => {
    const newAgent = await Promise.resolve(updatedAgent);
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ARCHIVED);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');
    expect(newAgent.phone).toBe('0123456789');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {}
    };
    await httpTrigger(context);
    console.log('Success with status code 500 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(500);
  });
  it('Valid Admin agent should fail with status code 400 for invalid request', async () => {
    const newAgent = await Promise.resolve(updatedAgent);
    expect(newAgent).toBeDefined();
    expect(newAgent.status).toBe(AgentStatus.ARCHIVED);
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');
    expect(newAgent.phone).toBe('0123456789');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {},
      body: {
        id: '1234' // Invalid id.
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 400 - ', context?.res?.statusCode);
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
