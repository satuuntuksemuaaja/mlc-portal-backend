import { Context } from '@azure/functions';
import httpTrigger from '../../api-create-item/index';
import { TestData } from '../data/testdata';
import { MeecoConnectionService } from '../../src/service/meeco.connection.service';
import { MeecoItemService } from '../../src/service/meeco.item.service';
import { MeecoShareService } from '../../src/service/meeco.share.service';

jest.mock('../../src/service/meeco.invitation.service');
jest.mock('../../src/service/invitation/invitation.bff.service');
jest.mock('../../src/service/meeco.connection.service');
jest.mock('../../src/service/meeco.item.service');
jest.mock('../../src/service/meeco.share.service');

describe('Test to agent list', () => {
  let context: Context;

  beforeAll(() => {
    jest.setTimeout(60000);
    context = { log: jest.fn() } as unknown as Context;
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Valid Admin should be able create item - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: '42ad9896-551f-11ed-bdc3-0242ac120002'
      },
      body: {
        name: 'My Item',
        notes: 'My notes'
      }
    };
    (MeecoConnectionService.prototype.loadAll as jest.Mock).mockReturnValueOnce(
      {
        connections: [
          {
            own: {
              id: '1222'
            },
            the_other_user: {
              id: '65e754eb-d0c6-442a-808e-9ecd151fd572',
              user_id: '87e0ec6d-f6b1-490d-80e3-28225aec32de'
            }
          }
        ]
      }
    );
    (MeecoShareService.prototype.shareItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.createItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValueOnce(
      true
    );
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.itemid).toBeDefined();
    expect(context?.res?.body?.itemid).toEqual('122');
    expect(context?.res?.body?.shareid).toBeDefined();
    expect(context?.res?.body?.shareid).toEqual('122');
  });

  it('Valid User should be able create item - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getUserAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: '42ad9896-551f-11ed-bdc3-0242ac120002'
      },
      body: {
        name: 'My Item',
        notes: 'My notes'
      }
    };
    (MeecoConnectionService.prototype.loadAll as jest.Mock).mockReturnValueOnce(
      {
        connections: [
          {
            own: {
              id: '1222'
            },
            the_other_user: {
              id: '65e754eb-d0c6-442a-808e-9ecd151fd572',
              user_id: '87e0ec6d-f6b1-490d-80e3-28225aec32de'
            }
          }
        ]
      }
    );
    (MeecoShareService.prototype.shareItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.createItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValueOnce(
      true
    );
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.itemid).toBeDefined();
  });

  it('Archived admin agent should fail', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: '42ad9896-551f-11ed-bdc3-0242ac120002'
      },
      body: {
        name: 'My Item',
        notes: 'My notes'
      }
    };
    (MeecoConnectionService.prototype.loadAll as jest.Mock).mockReturnValueOnce(
      {
        connections: [
          {
            own: {
              id: '1222'
            },
            the_other_user: {
              id: '65e754eb-d0c6-442a-808e-9ecd151fd572',
              user_id: '87e0ec6d-f6b1-490d-80e3-28225aec32de'
            }
          }
        ]
      }
    );
    (MeecoShareService.prototype.shareItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.createItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValueOnce(
      true
    );
    await httpTrigger(context);
    console.log('Fail with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('Archived user agent should fail', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedUserAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: '42ad9896-551f-11ed-bdc3-0242ac120002'
      },
      body: {
        name: 'My Item',
        notes: 'My notes'
      }
    };
    (MeecoConnectionService.prototype.loadAll as jest.Mock).mockReturnValueOnce(
      {
        connections: [
          {
            own: {
              id: '1222'
            },
            the_other_user: {
              id: '65e754eb-d0c6-442a-808e-9ecd151fd572',
              user_id: '87e0ec6d-f6b1-490d-80e3-28225aec32de'
            }
          }
        ]
      }
    );
    (MeecoShareService.prototype.shareItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.createItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValueOnce(
      true
    );
    await httpTrigger(context);
    console.log('Fail with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('Non Registered (In DB) agent should fail', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getNonConfiguredAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: '42ad9896-551f-11ed-bdc3-0242ac120002'
      },
      body: {
        name: 'My Item',
        notes: 'My notes'
      }
    };
    (MeecoConnectionService.prototype.loadAll as jest.Mock).mockReturnValueOnce(
      {
        connections: [
          {
            own: {
              id: '1222'
            },
            the_other_user: {
              id: '65e754eb-d0c6-442a-808e-9ecd151fd572',
              user_id: '87e0ec6d-f6b1-490d-80e3-28225aec32de'
            }
          }
        ]
      }
    );
    (MeecoShareService.prototype.shareItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.createItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValueOnce(
      true
    );
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });

  it('Request with invalid client id should fail', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: '06533ec4-64e1-11ed-9022-0242ac120002'
      },
      body: {
        name: 'My Item',
        notes: 'My notes'
      }
    };
    (MeecoConnectionService.prototype.loadAll as jest.Mock).mockReturnValueOnce(
      {
        connections: [
          {
            own: {
              id: '1222'
            },
            the_other_user: {
              id: '65e754eb-d0c6-442a-808e-9ecd151fd572',
              user_id: '87e0ec6d-f6b1-490d-80e3-28225aec32de'
            }
          }
        ]
      }
    );
    (MeecoShareService.prototype.shareItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.createItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValueOnce(
      true
    );
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });

  it('Invalid request will fail', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: '06533ec4-64e1-11ed-9022-0242ac120'
      },
      body: {
        name: 12,
        notes: 1223
      }
    };
    (MeecoConnectionService.prototype.loadAll as jest.Mock).mockReturnValueOnce(
      {
        connections: [
          {
            own: {
              id: '1222'
            },
            the_other_user: {
              id: '65e754eb-d0c6-442a-808e-9ecd151fd572',
              user_id: '87e0ec6d-f6b1-490d-80e3-28225aec32de'
            }
          }
        ]
      }
    );
    (MeecoShareService.prototype.shareItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.createItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValueOnce(
      true
    );
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
      params: {
        clientId: '42ad9896-551f-11ed-bdc3-0242ac120002'
      },
      body: {
        name: 'My Item',
        notes: 'My notes'
      }
    };
    (MeecoConnectionService.prototype.loadAll as jest.Mock).mockReturnValueOnce(
      {
        connections: [
          {
            own: {
              id: '1222'
            },
            the_other_user: {
              id: '65e754eb-d0c6-442a-808e-9ecd151fd572',
              user_id: '87e0ec6d-f6b1-490d-80e3-28225aec32de'
            }
          }
        ]
      }
    );
    (MeecoShareService.prototype.shareItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.createItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValueOnce(
      true
    );
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });

  it('Should return 500', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {}
    };
    await httpTrigger(context);
    console.log('Fail with status code 500 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(500);
  });
  it('Valid Admin should not be able to create item if cannot load connection ', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: '42ad9896-551f-11ed-bdc3-0242ac120002'
      },
      body: {
        name: 'My Item',
        notes: 'My notes'
      }
    };
    (MeecoShareService.prototype.shareItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.createItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValueOnce(
      true
    );
    (MeecoConnectionService.prototype.loadAll as jest.Mock).mockReturnValueOnce(
      {
        connections: []
      }
    );
    await httpTrigger(context);
    console.log('fail with status code 422 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(422);
  });

  it('Valid Admin should not be able to create item if client is not active ', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: '7a26a402-551f-11ed-bdc3-0242ac120002'
      },
      body: {
        name: 'My Item',
        notes: 'My notes'
      }
    };
    (MeecoConnectionService.prototype.loadAll as jest.Mock).mockReturnValueOnce(
      {
        connections: [
          {
            own: {
              id: '1222'
            },
            the_other_user: {
              id: '65e754eb-d0c6-442a-808e-9ecd151fd572',
              user_id: '87e0ec6d-f6b1-490d-80e3-28225aec32de'
            }
          }
        ]
      }
    );
    (MeecoShareService.prototype.shareItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.createItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValueOnce(
      true
    );
    await httpTrigger(context);
    console.log('fail with status code 422 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(422);
  });

  it('Valid Admin should not be able to create item if cannot share item to client ', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: '42ad9896-551f-11ed-bdc3-0242ac120002'
      },
      body: {
        name: 'My Item',
        notes: 'My notes'
      }
    };
    (MeecoConnectionService.prototype.loadAll as jest.Mock).mockReturnValueOnce(
      {
        own: {
          id: '1222'
        },
        connections: [
          {
            the_other_user: {
              id: '65e754eb-d0c6-442a-808e-9ecd151fd572',
              user_id: '87e0ec6d-f6b1-490d-80e3-28225aec32de'
            }
          }
        ]
      }
    );
    (MeecoShareService.prototype.shareItem as jest.Mock).mockImplementation(
      () => {
        throw new Error();
      }
    );
    (MeecoItemService.prototype.createItem as jest.Mock).mockReturnValue({
      id: '122'
    });
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValue(true);
    await httpTrigger(context);
    console.log('fail with status code 409 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(409);
  });
});
