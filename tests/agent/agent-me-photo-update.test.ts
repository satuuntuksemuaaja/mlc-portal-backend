import { Context } from '@azure/functions';
import { TestData } from '../data/testdata';
import httpTrigger from '../../api-agent-me-photo-update/index';

describe('Test', () => {
  let context: Context;

  beforeAll(() => {
    jest.setTimeout(60000);
    context = { log: jest.fn() } as unknown as Context;
  });

  it('Valid Admin agent should be able to update agent thumb - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {},
      body: {
        thumb:
          'data:image/png;base64,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'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
  });

  it('Valid Admin agent should be able to update agent thumb with dimension greter than 128  - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {},
      body: {
        thumb:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKgAAACoCAMAAABDlVWGAAAAYFBMVEVmZmb///9iYmJgYGBcXFxaWlpra2t0dHRoaGhvb2+CgoJ9fX3u7u7l5eW7u7tXV1f29vbPz8/Jycm1tbWIiIja2tqZmZmkpKTS0tJQUFDBwcGQkJCOjo6vr6/m5ub09PRb+GVoAAAE1UlEQVR4nO2aa5eqOgyGJS2Uq9xBwcv//5dbm4JzjqAdsNS9dp5Ps2ZV+5o2aZtktyMIgiAIgiAIgiAIgiAIgiD+JRh3U4nLmW0tswBPWV8WsZNlWZKXPUs52Nb0DMBOtLHzH+JW3P//VTCvPzgTHHrvm7YAsD6fknkn79nXGJWL85zMO2fBbStEWFU/VCVF2dwoi+Txv7r6iuXn/ehDSRMJb8du7DwRNaPWuP8CpazPBsOFNx8f9+P9z3AwdVZZX312GqwZpk9mY2k4WPVk2aa8UkI6f1IJ8zs1wK5NwcN1z1p3JgaB26ohns0oxQsU0aTzY9IGlRYWTcobXNbm5QZkwyhrSiFAVzm/WVTA8yAJbC1+WkoBh3e7Dzy8B5QvNohJILrIaB6+jTwslGfCJbJjUtZKO+01th7fy6GtnWDqSZePdcwEkTRp4ZlXNTE5rqde1ME4Foc21l5FHb2bEas04pghfOnzmas32pVRv/TNapoCAhlzcl2h8glwsBBKlX/oLiaGCC3P+zAQycUUmjODkBvFhtBQuof+B+RwC26vhB51xx9J6Bv+NqG68QYCa0IxPOm6MUTWwpOQl7yz5rWdy8vzRTeafRAI5FlTa16GU/nEz61c8qWNMt2TSR4PZ7OKZqZufnEh+tXgDwORfNodtG4lrrzBJJbeIjIJctW5kLLqeh/bmdc0OTtmFnKdp0iOeQo7byYQteb06ifVFoKThOMzNHk3PwhMVLTWUiU+5j8L/6VS8DFDVVt4hygYnvdO+dJUHBMqzvtEhTkGDfsXl6jjXufXmCZV+fviOd2MsBTX3YktJZ4U4Cull2iqRgcqP3XT+Xofm4eJIUt/FvA/qzIYC1CJsF4XYdGg9NJWOz6U6YDxXdVeBp2RdZ131x/rYXHX9pHHXZd7Ud92Y/2ptunwD5jYOyNxUudFkdfJj0rz3v66I+BXmTPLtbLtRw/YMZgsguP2PH5JfwEA/KzaPpM13je0F4B3mrXmuPqtsC31Zs3ip/HQl9Cbfu7bpJkuQW4F88uHd8eHsqmiANwbEERVU+aXh9Q80sykmsANH6uet5XgjA1LDMAYD8Kmyx5GtXYr4c1ozi4M4Ll35KbWe7RxZKWdjQq8Hax1EDCrAcDrxp9jo2UHdsN5dKnmauBqJBfDDrGRw9+pO7Ozf+/PDNqr2smbK1UPOydutdqa+EmdCfnGi++qGrxW+uEOD5TSbV8kKvPhJPqdIkwopc2G8RTUO1nbnndYhB/SKJt/DFXVvv6uR2iwaW5K1vOM/XXRIvIKD4ityvag/KL89XyqFWGr7CPgdPWCRibM6jmlAVUTk6kH8mlBnGFYQN2mOAI9ntuL4qHKAbWbrD3u0IUdbAxD1IclTYH1bKdYmEpy0aQbxFK3WGPQ260PPdF8ysxFgy7/AjwsjJ+jqlZ7WuwNgP06xhtf0W3j5WUDVUPV6T9bBWZuuxUtYfgyMZ3XBX/1aa3OUcNXfewIy9bsMHaSp5Ph3nw0x6pbhaqhGr5C4U30sKYEB/gmXXYEa+NKT1jXXontnJ3ZSIqNDN0qR4Bug7MplftLt5FkGmwvSQwLjddHa9znpgOpd2dl9dWXX/IZPfPAfD5s0+8gCIIgCIIgCIIgCIIgCIIgCIIgCIIgCMI8fwCCkS5PIcwzgAAAAABJRU5ErkJggg=='
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
  });

  it('Non Registered (In DB) agent should fail', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getNonConfiguredAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {},
      body: {
        thumb: 'iVBORw0KGgoAAAANSUhEUgAAAfMA'
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });

  it('Valid Admin agent should fail with status code 500', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {},
      body: {
        thumb: 'iVBORw0KGgoAAAANSUhEUgAAAfMA'
      }
    };
    await httpTrigger(context);
    console.log('Success with status code 500 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(500);
  });
  it('Valid Admin agent should fail with status code 400 for invalid request', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminPlutoAgent()
      },
      method: 'PUT',
      url: '',
      query: {},
      params: {},
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
