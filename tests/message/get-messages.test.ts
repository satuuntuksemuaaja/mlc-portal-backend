import { Context } from '@azure/functions';
import httpTrigger from '../../api-messages-list/index';
import { TestData } from '../data/testdata';
import { MeecoItemService } from '../../src/service/meeco.item.service';
import { MeecoItemConversion } from '../../src/meeco/item/item.conversion';

jest.mock('../../src/meeco/item/item.conversion');
jest.mock('../../src/service/meeco.item.service');

describe('Test to agent list', () => {
  let context: Context;

  beforeAll(() => {
    jest.setTimeout(60000);
    context = { log: jest.fn() } as unknown as Context;
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Valid Admin should be able get messages - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getAdminAgent()
      },
      method: null,
      url: '',
      query: {
        nextPageAfter: '1213'
      },
      params: {
        clientId: '42ad9896-551f-11ed-bdc3-0242ac120002'
      }
    };
    (MeecoItemService.prototype.getMessages as jest.Mock).mockReturnValueOnce({
      next_page_after: '122',
      items: [{ own: true }, { own: false }]
    });
    (MeecoItemConversion.prototype.convertItems as jest.Mock).mockReturnValue([
      { own: true }
    ]);
    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.next_page_after).toBeDefined();
    expect(context?.res?.body?.next_page_after).toEqual('122');
    expect(context?.res?.body?.items).toBeDefined();
    expect(context?.res?.body?.items?.length).toEqual(1);
  });

  it('Valid User should be able get messages - Http status code: 200', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getUserAgent()
      },
      method: null,
      url: '',
      query: {
        nextPageAfter: '1213'
      },
      params: {
        clientId: '42ad9896-551f-11ed-bdc3-0242ac120002'
      }
    };

    (MeecoItemService.prototype.getMessages as jest.Mock).mockReturnValueOnce({
      next_page_after: '122',
      items: [{ own: true }, { own: false }]
    });

    (MeecoItemConversion.prototype.convertItems as jest.Mock).mockReturnValue([
      { own: true }
    ]);

    await httpTrigger(context);
    console.log('Success with status code 200 - ', context?.res?.statusCode);
    expect(context?.res?.statusCode).toEqual(200);
    expect(context?.res?.body?.next_page_after).toBeDefined();
    expect(context?.res?.body?.next_page_after).toEqual('122');
    expect(context?.res?.body?.items).toBeDefined();
    expect(context?.res?.body?.items?.length).toEqual(1);
  });

  it('Archived admin agent should fail', async () => {
    context.req = {
      headers: {
        authorization: new TestData().getAcme().getArchivedAdminAgent()
      },
      method: null,
      url: '',
      query: {
        nextPageAfter: '1213'
      },
      params: {
        clientId: '42ad9896-551f-11ed-bdc3-0242ac120002'
      }
    };
    (MeecoItemService.prototype.getMessages as jest.Mock).mockReturnValueOnce({
      next_page_after: '122',
      items: [{ own: true }, { own: false }]
    });
    (MeecoItemConversion.prototype.convertItems as jest.Mock).mockReturnValue([
      { own: true }
    ]);
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
      query: {
        nextPageAfter: '1213'
      },
      params: {
        clientId: '42ad9896-551f-11ed-bdc3-0242ac120002'
      }
    };
    (MeecoItemService.prototype.getMessages as jest.Mock).mockReturnValueOnce({
      next_page_after: '122',
      items: [{ own: true }, { own: false }]
    });
    (MeecoItemConversion.prototype.convertItems as jest.Mock).mockReturnValue([
      { own: true }
    ]);
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
      query: {
        nextPageAfter: '1213'
      },
      params: {
        clientId: '42ad9896-551f-11ed-bdc3-0242ac120002'
      }
    };
    (MeecoItemService.prototype.getMessages as jest.Mock).mockReturnValueOnce({
      next_page_after: '122',
      items: [{ own: true }, { own: false }]
    });
    (MeecoItemConversion.prototype.convertItems as jest.Mock).mockReturnValue([
      { own: true }
    ]);
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
      query: {
        nextPageAfter: '1213'
      },
      params: {
        clientId: '06533ec4-64e1-11ed-9022-0242ac120002'
      }
    };
    (MeecoItemService.prototype.getMessages as jest.Mock).mockReturnValueOnce({
      next_page_after: '122',
      items: [{ own: true }, { own: false }]
    });
    (MeecoItemConversion.prototype.convertItems as jest.Mock).mockReturnValue([
      { own: true }
    ]);
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
      query: {
        nextPageAfter: '1213'
      },
      params: {
        clientId: '42ad9896-551f-11ed-bdc3-0242'
      }
    };
    (MeecoItemService.prototype.getMessages as jest.Mock).mockReturnValueOnce({
      next_page_after: '122',
      items: [{ own: true }, { own: false }]
    });
    (MeecoItemConversion.prototype.convertItems as jest.Mock).mockReturnValue([
      { own: true }
    ]);
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
      query: {
        nextPageAfter: '1213'
      },
      params: {
        clientId: '42ad9896-551f-11ed-bdc3-0242ac120002'
      }
    };
    (MeecoItemService.prototype.getMessages as jest.Mock).mockReturnValueOnce({
      next_page_after: '122',
      items: [{ own: true }, { own: false }]
    });
    (MeecoItemConversion.prototype.convertItems as jest.Mock).mockReturnValue([
      { own: true }
    ]);
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
});
