import { SecureImagePipe } from './secure-image.pipe';

describe('SecureImagePipe', () => {
  it('create an instance', () => {
    const pipe = new SecureImagePipe();
    expect(pipe).toBeTruthy();
  });
});
