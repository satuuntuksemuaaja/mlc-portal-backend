import { MeecoItemService } from '../../src/service/meeco.item.service';

describe('Create Item Tests', () => {
  beforeAll(async () => {
    jest.setTimeout(600000);
  });

  it('Item Test', async () => {
    const mis = new MeecoItemService('ACME');
    const r = await mis.createItem('test.item', 'item notes');

    expect(r.id).toBeDefined();
    expect(r.item).toBeDefined();
    expect(r.item.label).toBe('ppgenericitem');
    expect(r.item.classification_node_ids).toBeDefined();
    expect(
      r.classification_nodes.find((x) => x.name === 'mlcpp_file')
    ).toBeDefined();
    expect(r.values?.name).toBe('test.item');
    expect(r.values?.notes).toBe('item notes');
  });
});
