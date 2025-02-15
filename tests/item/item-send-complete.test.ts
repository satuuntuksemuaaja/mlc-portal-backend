import { Context } from '@azure/functions';
import httpTrigger from '../../api-item-send-complete/index';
import { TestData } from '../data/testdata';
import { BffItemService } from '../../src/service/item/item.bff.service';
import { MeecoItemService } from '../../src/service/meeco.item.service';
import { MeecoShareService } from '../../src/service/meeco.share.service';
import { CreateItemController } from '../../src/controller/item/create.item.controller';
import { CreateItemResponse } from '../../src/interface/response/item.response.interface';
import { MeecoConnectionService } from '../../src/service/meeco.connection.service';

jest.mock('../../src/service/meeco.share.service');
jest.mock('../../src/service/meeco.item.service');
jest.mock('../../src/service/item/item.bff.service');
jest.mock('../../src/service/meeco.connection.service');

describe('Test to agent list', () => {
  let context: Context;
  let item: CreateItemResponse;

  beforeAll(async () => {
    jest.setTimeout(60000);
    context = { log: jest.fn() } as unknown as Context;
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
    (MeecoConnectionService.prototype.loadAll as jest.Mock).mockReturnValue({
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
    (MeecoShareService.prototype.shareItem as jest.Mock).mockReturnValue({
      id: '122'
    });
    (MeecoItemService.prototype.createItem as jest.Mock).mockReturnValue({
      id: '122'
    });
    (MeecoItemService.prototype.deleteItem as jest.Mock).mockReturnValue(true);
    item = await new CreateItemController(context).run();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Valid Admin agent should be able to complete send item - Http status code: 200', async () => {
    const newItem = item;
    expect(newItem).toBeDefined();
    expect(newItem.itemid).toBeDefined();
    expect(newItem.itemid).toEqual('122');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: '42ad9896-551f-11ed-bdc3-0242ac120002',
        itemId: newItem.itemid
      },
      body: {}
    };
    (MeecoItemService.prototype.getItem as jest.Mock).mockReturnValue({
      name: 'name',
      slots: [
        {
          name: 'name',
          value: 'My item'
        }
      ]
    });
    (BffItemService.prototype.createItem as jest.Mock).mockReturnValue({
      ok: true
    });
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
  });

  it('Valid User agent should be able to complete send item - Http status code: 200', async () => {
    const newItem = item;
    expect(newItem).toBeDefined();
    expect(newItem.itemid).toBeDefined();
    expect(newItem.itemid).toEqual('122');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getUserAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: '42ad9896-551f-11ed-bdc3-0242ac120002',
        itemId: newItem.itemid
      },
      body: {}
    };
    (MeecoItemService.prototype.getItem as jest.Mock).mockReturnValue({
      name: 'name',
      slots: [
        {
          name: 'name',
          value: 'My item'
        }
      ]
    });
    (BffItemService.prototype.createItem as jest.Mock).mockReturnValue({
      ok: true
    });
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
  });

  it('Request with client from different organisation should fail ', async () => {
    const newItem = item;
    expect(newItem).toBeDefined();
    expect(newItem.itemid).toBeDefined();
    expect(newItem.itemid).toEqual('122');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: '8c6b0ae0-551f-11ed-bdc3-0242ac120002',
        itemId: newItem.itemid
      },
      body: {}
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });
  it('Invalid request will fail', async () => {
    const newItem = item;
    expect(newItem).toBeDefined();
    expect(newItem.itemid).toBeDefined();
    expect(newItem.itemid).toEqual('122');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: '42ad9896-551f-11ed-bdc3-0242a'
      },
      body: {}
    };
    await httpTrigger(context);
    console.log('Fail with status code 400 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(400);
  });

  it('Invalid header token', async () => {
    const newItem = item;
    expect(newItem).toBeDefined();
    expect(newItem.itemid).toBeDefined();
    expect(newItem.itemid).toEqual('122');

    context.req = {
      headers: {
        authorization: ''
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: '42ad9896-551f-11ed-bdc3-0242ac120002',
        itemId: newItem.itemid
      }
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });
});
