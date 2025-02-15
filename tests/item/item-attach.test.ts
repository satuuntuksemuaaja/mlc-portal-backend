import { Context } from '@azure/functions';
import httpTrigger from '../../api-item-attach/index';
import { CreateItemController } from '../../src/controller/item/create.item.controller';
import { CreateItemResponse } from '../../src/interface/response/item.response.interface';
import { TestData } from '../data/testdata';
import { MeecoItemService } from '../../src/service/meeco.item.service';
import { MeecoShareService } from '../../src/service/meeco.share.service';
import { MeecoConnectionService } from '../../src/service/meeco.connection.service';
import MeecoAttachmentService from '../../src/service/meeco.file.service';
import multipart from 'parse-multipart';
import { MeecoItemConversion } from '../../src/meeco/item/item.conversion';

jest.mock('../../src/meeco/item/item.conversion');
jest.mock('../../src/service/meeco.share.service');
jest.mock('parse-multipart');
jest.mock('../../src/service/meeco.item.service');
jest.mock('../../src/service/meeco.connection.service');
jest.mock('../../src/service/meeco.file.service');

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

  it('Valid Admin should be able attach item - Http status code: 200', async () => {
    const newItem = item;
    expect(newItem).toBeDefined();
    expect(newItem.itemid).toBeDefined();
    expect(newItem.itemid).toEqual('122');

    context.req = {
      headers: {
        'content-type': 'multipart/form-data',
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {},
      params: {
        clientId: '42ad9896-551f-11ed-bdc3-0242ac120002',
        itemId: newItem.itemid
      },
      body: [
        '<Buffer cf 73 70 e2 2f f1 99 b9 13 34 4f c0 ff 8a 1f 6b a3 44 1c 05 b0 80 01 ed ce d4 eb 51 60 f4 92 c0 d7 6d ae 55 e2 f5 8d 12 79 11 17 4a 70 47 12 da de 40 >'
      ]
    };
    (MeecoItemService.prototype.getItem as jest.Mock).mockReturnValue(true);
    (
      MeecoItemService.prototype.hasSharedItemWithUser as jest.Mock
    ).mockReturnValue(true);
    (MeecoAttachmentService.prototype.upload as jest.Mock).mockReturnValue({
      id: '122'
    });
    (multipart.Parse as jest.Mock).mockReturnValue([
      {
        filename: 'xyz',
        data: '<Buffer cf 73 70 e2 2f f1 99 b9 13 34 4f c0 ff 8a 1f 6b a3 44 1c 05 b0 80 01 ed ce d4 eb 51 60 f4 92 c0 d7 6d ae 55 e2 f5 8d 12 79 11 17 4a 70 47 12 da de 40 >',
        mimetype: 'png'
      }
    ]);
    (MeecoShareService.prototype.reShareItem as jest.Mock).mockReturnValue(
      true
    );
    (MeecoItemConversion.prototype.convert as jest.Mock).mockReturnValue(true);
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
  });

  it('Valid Admin should not be able attach item if can not find item', async () => {
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
    (MeecoItemService.prototype.getItem as jest.Mock).mockReturnValue(false);
    (
      MeecoItemService.prototype.hasSharedItemWithUser as jest.Mock
    ).mockReturnValue(true);
    (MeecoAttachmentService.prototype.upload as jest.Mock).mockReturnValue(
      true
    );
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });

  it('Valid Admin should not be able attach item if item is not shared with client', async () => {
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
    (MeecoItemService.prototype.getItem as jest.Mock).mockReturnValue(true);
    (
      MeecoItemService.prototype.hasSharedItemWithUser as jest.Mock
    ).mockReturnValue(false);
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });

  it('Archived admin agent should fail', async () => {
    const newItem = item;
    expect(newItem).toBeDefined();
    expect(newItem.itemid).toBeDefined();
    expect(newItem.itemid).toEqual('122');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedAdminAgent()
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
    (MeecoItemService.prototype.getItem as jest.Mock).mockReturnValue(true);
    (
      MeecoItemService.prototype.hasSharedItemWithUser as jest.Mock
    ).mockReturnValue(true);
    await httpTrigger(context);
    console.log('Fail with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('Archived user agent should fail', async () => {
    const newItem = item;
    expect(newItem).toBeDefined();
    expect(newItem.itemid).toBeDefined();
    expect(newItem.itemid).toEqual('122');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedUserAgent()
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
    (MeecoItemService.prototype.getItem as jest.Mock).mockReturnValue(true);
    (
      MeecoItemService.prototype.hasSharedItemWithUser as jest.Mock
    ).mockReturnValue(true);
    await httpTrigger(context);
    console.log('Fail with status code 403 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(403);
  });

  it('Non Registered (In DB) agent should fail', async () => {
    const newItem = item;
    expect(newItem).toBeDefined();
    expect(newItem.itemid).toBeDefined();
    expect(newItem.itemid).toEqual('122');

    context.req = {
      headers: {
        authorization: new TestData().getAcme().getNonConfiguredAgent()
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
    (MeecoItemService.prototype.getItem as jest.Mock).mockReturnValue(true);
    (
      MeecoItemService.prototype.hasSharedItemWithUser as jest.Mock
    ).mockReturnValue(true);
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });

  it('Request with invalid client id should fail', async () => {
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
        clientId: '06533ec4-64e1-11ed-9022-0242ac120002',
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
        clientId: '06533ec4-64e1-11ed-9022-02'
      },
      body: {
        name: 12,
        notes: 1223
      }
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
      },
      body: {}
    };
    await httpTrigger(context);
    console.log('Fail with status code 404 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(404);
  });

  it('Should return 500', async () => {
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
      query: {}
    };
    await httpTrigger(context);
    console.log('Fail with status code 500 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(500);
  });
});
