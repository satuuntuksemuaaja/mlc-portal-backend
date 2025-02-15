import { Context } from '@azure/functions';
import httpTrigger from '../../api-message-send/index';
import { TestData } from '../data/testdata';
import { MeecoConnectionService } from '../../src/service/meeco.connection.service';
import { MeecoItemService } from '../../src/service/meeco.item.service';
import { MeecoShareService } from '../../src/service/meeco.share.service';
import { MeecoItemConversion } from '../../src/meeco/item/item.conversion';

jest.mock('../../src/service/meeco.invitation.service');
jest.mock('../../src/meeco/item/item.conversion');
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

  it('Valid Admin should be able send message - Http status code: 200', async () => {
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
        msg: 'message'
      }
    };
    (
      MeecoConnectionService.prototype.getForUser as jest.Mock
    ).mockReturnValueOnce({
      connection: {
        own: {
          id: '1222'
        },
        the_other_user: {
          id: '65e754eb-d0c6-442a-808e-9ecd151fd572',
          user_id: '87e0ec6d-f6b1-490d-80e3-28225aec32de'
        }
      }
    });
    (MeecoShareService.prototype.shareItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.createMessage as jest.Mock).mockReturnValueOnce(
      {
        id: '122'
      }
    );
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValueOnce(
      true
    );
    (MeecoItemConversion.prototype.convert as jest.Mock).mockReturnValue(true);
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
  });

  it('Valid User should be able send message - Http status code: 200', async () => {
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
        msg: 'message'
      }
    };
    (
      MeecoConnectionService.prototype.getForUser as jest.Mock
    ).mockReturnValueOnce({
      connection: {
        own: {
          id: '1222'
        },
        the_other_user: {
          id: '65e754eb-d0c6-442a-808e-9ecd151fd572',
          user_id: '87e0ec6d-f6b1-490d-80e3-28225aec32de'
        }
      }
    });
    (MeecoShareService.prototype.shareItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.createMessage as jest.Mock).mockReturnValueOnce(
      {
        id: '122'
      }
    );
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValueOnce(
      true
    );
    (MeecoItemConversion.prototype.convert as jest.Mock).mockReturnValue(true);
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
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
        msg: 'message'
      }
    };
    (
      MeecoConnectionService.prototype.getForUser as jest.Mock
    ).mockReturnValueOnce({
      connection: {
        own: {
          id: '1222'
        },
        the_other_user: {
          id: '65e754eb-d0c6-442a-808e-9ecd151fd572',
          user_id: '87e0ec6d-f6b1-490d-80e3-28225aec32de'
        }
      }
    });
    (MeecoShareService.prototype.shareItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.createMessage as jest.Mock).mockReturnValueOnce(
      {
        id: '122'
      }
    );
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValueOnce(
      true
    );
    (MeecoItemConversion.prototype.convert as jest.Mock).mockReturnValue(true);
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
        msg: 'message'
      }
    };
    (
      MeecoConnectionService.prototype.getForUser as jest.Mock
    ).mockReturnValueOnce({
      connection: {
        own: {
          id: '1222'
        },
        the_other_user: {
          id: '65e754eb-d0c6-442a-808e-9ecd151fd572',
          user_id: '87e0ec6d-f6b1-490d-80e3-28225aec32de'
        }
      }
    });
    (MeecoShareService.prototype.shareItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.createMessage as jest.Mock).mockReturnValueOnce(
      {
        id: '122'
      }
    );
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValueOnce(
      true
    );
    (MeecoItemConversion.prototype.convert as jest.Mock).mockReturnValue(true);
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
        msg: 'message'
      }
    };
    (
      MeecoConnectionService.prototype.getForUser as jest.Mock
    ).mockReturnValueOnce({
      connection: {
        own: {
          id: '1222'
        },
        the_other_user: {
          id: '65e754eb-d0c6-442a-808e-9ecd151fd572',
          user_id: '87e0ec6d-f6b1-490d-80e3-28225aec32de'
        }
      }
    });
    (MeecoShareService.prototype.shareItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.createMessage as jest.Mock).mockReturnValueOnce(
      {
        id: '122'
      }
    );
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValueOnce(
      true
    );
    (MeecoItemConversion.prototype.convert as jest.Mock).mockReturnValue(true);
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
        msg: 'message'
      }
    };
    (
      MeecoConnectionService.prototype.getForUser as jest.Mock
    ).mockReturnValueOnce({
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
    });
    (MeecoShareService.prototype.shareItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.createMessage as jest.Mock).mockReturnValueOnce(
      {
        id: '122'
      }
    );
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValueOnce(
      true
    );
    (MeecoItemConversion.prototype.convert as jest.Mock).mockReturnValue(true);
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
    (
      MeecoConnectionService.prototype.getForUser as jest.Mock
    ).mockReturnValueOnce({
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
    });
    (MeecoShareService.prototype.shareItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.createMessage as jest.Mock).mockReturnValueOnce(
      {
        id: '122'
      }
    );
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValueOnce(
      true
    );
    (MeecoItemConversion.prototype.convert as jest.Mock).mockReturnValue(true);
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
        msg: 'message'
      }
    };
    (
      MeecoConnectionService.prototype.getForUser as jest.Mock
    ).mockReturnValueOnce({
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
    });
    (MeecoShareService.prototype.shareItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.createMessage as jest.Mock).mockReturnValueOnce(
      {
        id: '122'
      }
    );
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValueOnce(
      true
    );
    (MeecoItemConversion.prototype.convert as jest.Mock).mockReturnValue(true);
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
  it('Valid Admin should not be able to send message if cannot load connection ', async () => {
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
        msg: 'message'
      }
    };
    (MeecoShareService.prototype.shareItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.createMessage as jest.Mock).mockReturnValueOnce(
      {
        id: '122'
      }
    );
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValueOnce(
      true
    );
    (
      MeecoConnectionService.prototype.getForUser as jest.Mock
    ).mockReturnValueOnce(false);
    (MeecoItemConversion.prototype.convert as jest.Mock).mockReturnValue(true);
    await httpTrigger(context);
    console.log('fail with status code 422 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(422);
  });

  it('Valid Admin should not be able to send message if cannot share item to client ', async () => {
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
        msg: 'message'
      }
    };
    (
      MeecoConnectionService.prototype.getForUser as jest.Mock
    ).mockReturnValueOnce({
      own: {
        id: '1222'
      },
      the_other_user: {
        id: '65e754eb-d0c6-442a-808e-9ecd151fd572',
        user_id: '87e0ec6d-f6b1-490d-80e3-28225aec32de'
      }
    });
    (MeecoShareService.prototype.shareItem as jest.Mock).mockImplementation(
      () => {
        throw new Error();
      }
    );
    (MeecoItemService.prototype.createMessage as jest.Mock).mockReturnValue({
      id: '122'
    });
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValue(true);
    (MeecoItemConversion.prototype.convert as jest.Mock).mockReturnValue(true);
    await httpTrigger(context);
    console.log('fail with status code 409 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(409);
  });
  it('Valid Admin should be able send message to archived client if client has active subscription', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminPlutoAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: '8c6b0ae0-551f-11ed-bdc3-0242ac120002'
      },
      body: {
        msg: 'message'
      }
    };
    (
      MeecoConnectionService.prototype.getForUser as jest.Mock
    ).mockReturnValueOnce({
      own: {
        id: '1222'
      },
      the_other_user: {
        id: '65e754eb-d0c6-442a-808e-9ecd151fd572',
        user_id: '87e0ec6d-f6b1-490d-80e3-28225aec32de'
      }
    });
    (MeecoShareService.prototype.shareItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.createMessage as jest.Mock).mockReturnValueOnce(
      {
        id: '122'
      }
    );
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValueOnce(
      true
    );
    (MeecoItemConversion.prototype.convert as jest.Mock).mockReturnValue(true);
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
  });
  it('Valid Admin should be able send message to archived client if client has expired subscription', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: '7f0b198a-551f-11ed-bdc3-0242ac120002'
      },
      body: {
        msg: 'message'
      }
    };
    (
      MeecoConnectionService.prototype.getForUser as jest.Mock
    ).mockReturnValueOnce({
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
    });
    (MeecoShareService.prototype.shareItem as jest.Mock).mockReturnValueOnce({
      id: '122'
    });
    (MeecoItemService.prototype.createMessage as jest.Mock).mockReturnValueOnce(
      {
        id: '122'
      }
    );
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValueOnce(
      true
    );
    (MeecoItemConversion.prototype.convert as jest.Mock).mockReturnValue(true);
    await httpTrigger(context);
    console.log('fail with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });
});
