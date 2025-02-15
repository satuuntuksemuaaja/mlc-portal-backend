import { MeecoItemConversion } from '../../src/meeco/item/item.conversion';
import { DecryptedItem } from '@meeco/sdk';

describe('Correct Item Conversion', () => {
  beforeAll(() => {});

  it('Convert an Item', async () => {
    const item = {
      label: 'otherid',
      id: '121212',
      share_id: '454545',
      item: {
        created_at: new Date(),
        updated_at: new Date()
      },
      own: true,
      classification_nodes: [
        {
          id: '0e6e868b-d3c0-4272-a312-101cec6febc9',
          image: null,
          label: 'Pw',
          name: 'pw'
        }
      ],
      slots: [
        {
          name: 'name',
          value: 'Drivers License'
        },
        {
          name: 'notes',
          value: 'My Vic License'
        }
      ]
    } as DecryptedItem;

    const result = new MeecoItemConversion().convert(item);

    expect(result.label).toBe('otherid');
    expect(result.id).toBe('121212');
    expect(result.shareId).toBe('454545');
    expect(result.own).toBe(true);

    expect(result.created).toBeInstanceOf(Date);
    expect(result.modified).toBeInstanceOf(Date);

    expect(result.classifications.length).toBe(1);
    expect(result.classifications[0]).toBe('pw');

    expect(result.values.length).toBe(2);
    expect(result.values.find((e) => e.k == 'name')?.v)?.toBe(
      'Drivers License'
    );
    expect(result.values.find((e) => e.k == 'notes')?.v).toBe('My Vic License');
  });
});
