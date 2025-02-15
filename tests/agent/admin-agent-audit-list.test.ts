import { Context } from '@azure/functions';
import { TestData } from '../data/testdata';
import httpTrigger from '../../api-admin-agent-audit-list/index';
import { AgentRepository } from '../../src/repository/agent.repository';
import { AgentResponse } from '../../src/interface/response/agent.response.interface';
import { TestHelper } from '../data/testhelper';

describe('Test to agent audit list', () => {
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
    return (updatedAgent = AgentRepository.adminUpdateAgent(
      {
        orgId: 'cd0bcea6-551d-11ed-bdc3-0242ac120002',
        id: '353f8c6a-551e-11ed-bdc3-0242ac120002'
      },
      {
        id: agent?.id,
        name: 'Acme Admin agent1',
        roleId: 1002,
        phone: '0123456789'
      }
    ));
  });

  it('Valid Admin agent should be able to list client audits - Http status code: 200', async () => {
    const newAgent = await Promise.resolve(updatedAgent);
    expect(newAgent).toBeDefined();
    expect(newAgent.roleId).toBe('1002');
    expect(newAgent.name).toBe('Acme Admin agent1');
    expect(newAgent.id).toBe(agent?.id);
    expect(newAgent.phone).toBe('0123456789');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        id: '353f8c6a-551e-11ed-bdc3-0242ac120002'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    console.log(
      'Agent audit list length should be greater or equal to 1 - ',
      context?.res?.body?.agents?.length
    );
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.agents?.length).toBeGreaterThanOrEqual(1);
    const agentAudits = context?.res?.body?.agents.filter(
      (data) => data.orgId != 'cd0bcea6-551d-11ed-bdc3-0242ac120002'
    );
    expect(0).toEqual(agentAudits.length);
  });

  it('User level agent should fail', async () => {
    const newAgent = await Promise.resolve(updatedAgent);
    expect(newAgent).toBeDefined();
    expect(newAgent.roleId).toBe('1002');
    expect(newAgent.name).toBe('Acme Admin agent1');
    expect(newAgent.id).toBe(agent?.id);

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getUserAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        id: '353f8c6a-551e-11ed-bdc3-0242ac120002'
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('Archived admin agent should fail', async () => {
    const newAgent = await Promise.resolve(updatedAgent);
    expect(newAgent).toBeDefined();
    expect(newAgent.roleId).toBe('1002');
    expect(newAgent.name).toBe('Acme Admin agent1');
    expect(newAgent.id).toBe(agent?.id);

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {}
    };
    await httpTrigger(context);
    console.log('Fail with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('Archived user agent should fail', async () => {
    const newAgent = await Promise.resolve(updatedAgent);
    expect(newAgent).toBeDefined();
    expect(newAgent.roleId).toBe('1002');
    expect(newAgent.name).toBe('Acme Admin agent1');
    expect(newAgent.id).toBe(agent?.id);

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedUserAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {}
    };
    await httpTrigger(context);
    console.log('Fail with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('Non Registered (In DB) agent should fail', async () => {
    const newAgent = await Promise.resolve(updatedAgent);
    expect(newAgent).toBeDefined();
    expect(newAgent.roleId).toBe('1002');
    expect(newAgent.name).toBe('Acme Admin agent1');
    expect(newAgent.id).toBe(agent?.id);

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getNonConfiguredAgent()
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

  it('Valid Admin agent should fail with status code 500', async () => {
    const newAgent = await Promise.resolve(updatedAgent);
    expect(newAgent).toBeDefined();
    expect(newAgent.roleId).toBe('1002');
    expect(newAgent.name).toBe('Acme Admin agent1');
    expect(newAgent.id).toBe(agent?.id);

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
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        id: '353f8c6a-551e-11ed-bdc3-0242ac12000'
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
