import { OrganizationService } from '@meeco/sdk';
import { MimeHelper } from '../../src/util/mime';

describe('Mime test', () => {
  beforeAll(async () => {
    jest.setTimeout(600000);
  });

  it('jpeg', async () => {
    expect(MimeHelper.getMime('test.JPG')).toBe('image/jpg');
    expect(MimeHelper.getMime('test.jpg')).toBe('image/jpg');
    expect(MimeHelper.getMime('test.jPg')).toBe('image/jpg');

    expect(MimeHelper.getMime('test.jpeg')).toBe('image/jpeg');
    expect(MimeHelper.getMime('test.JPEG')).toBe('image/jpeg');
    expect(MimeHelper.getMime('test.JpEg')).toBe('image/jpeg');
  });
});
