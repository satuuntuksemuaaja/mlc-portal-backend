import { Context } from '@azure/functions';
import { TestData } from '../data/testdata';
import httpTrigger from '../../api-admin-agent/index';
import { AgentRepository } from '../../src/repository/agent.repository';
import { TestHelper } from '../data/testhelper';
import { AgentResponse } from '../../src/interface/response/agent.response.interface';

describe('Test to update agent', () => {
  let context: Context;
  let agent: Promise<AgentResponse>;

  beforeAll(() => {
    jest.setTimeout(60000);
    context = { log: jest.fn() } as unknown as Context;

    // create a new agent
    return (agent = AgentRepository.adminCreateAgent(
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
    ));
  });

  it('Valid Admin agent should be able to update agent - Http status code: 200', async () => {
    const newAgent = await Promise.resolve(agent);
    expect(newAgent).toBeDefined();
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');
    expect(newAgent.phone).toBe('0123456789');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'PUT',
      url: '',
      query: {},
      params: {},
      body: {
        id: newAgent.id,
        roleId: 1002,
        name: 'Jill Jill',
        phone: '0289866544'
      }
    };
    await httpTrigger(context);

    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body.agent).toBeDefined();
    expect(context?.res?.body.agent.id).toBe(newAgent.id);
    expect(context?.res?.body.agent.roleId).toBe('1002');
    expect(context?.res?.body.agent.name).toBe('Jill Jill');
  });

  it('User level agent should fail to update agent', async () => {
    const newAgent = await Promise.resolve(agent);
    expect(newAgent).toBeDefined();
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getUserAgent()
      },
      method: 'PUT',
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

  it('Archived admin agent should fail to update agent', async () => {
    const newAgent = await Promise.resolve(agent);
    expect(newAgent).toBeDefined();
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedAdminAgent()
      },
      method: 'PUT',
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

  it('Archived user agent should fail to update agent', async () => {
    const newAgent = await Promise.resolve(agent);
    expect(newAgent).toBeDefined();
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedUserAgent()
      },
      method: 'PUT',
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
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getNonConfiguredAgent()
      },
      method: 'PUT',
      url: '',
      query: {},
      params: {}
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });

  it('Valid Admin agent should not be able to update agent from other organisation', async () => {
    const newAgent = await Promise.resolve(agent);
    expect(newAgent).toBeDefined();
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminPlutoAgent()
      },
      method: 'PUT',
      url: '',
      query: {},
      params: {},
      body: {
        id: newAgent.id,
        roleId: 102,
        name: 'Jilll',
        phone: '0289866544'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('Valid Admin agent should fail with status code 500', async () => {
    const newAgent = await Promise.resolve(agent);
    expect(newAgent).toBeDefined();
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: 'PUT',
      url: '',
      query: {},
      params: {},
      body: {
        id: newAgent.id,
        roleId: 102,
        name: 'Jilll',
        phone: '0289866544'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 500 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(500);
  });

  it('Valid Admin agent should fail with status code 400 for invalid request', async () => {
    const newAgent = await Promise.resolve(agent);
    expect(newAgent).toBeDefined();
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminPlutoAgent()
      },
      method: 'PUT',
      url: '',
      query: {},
      params: {},
      body: {
        id: '1234',
        roleId: '1002',
        name: 'Ji',
        phone: '3242424'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 400 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(400);
  });

  it('Invalid header token', async () => {
    const newAgent = await Promise.resolve(agent);
    expect(newAgent).toBeDefined();
    expect(newAgent.roleId).toBe('1001');
    expect(newAgent.name).toBe('Acme Admin agent1');
    expect(newAgent.phone).toBe('0123456789');

    context.req = {
      headers: {
        authorization: ''
      },
      method: 'PUT',
      url: '',
      query: {},
      params: {},
      body: {
        id: newAgent.id,
        roleId: 1002,
        name: 'Jill Jill',
        phone: '0289866544'
      }
    };
    await httpTrigger(context);
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });
});
