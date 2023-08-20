import { base64Decode, base64Encode, urlSafeBase64Decode, urlSafeBase64Encode } from '../mime.js';

describe(`Success Tests`, () => {
  test(`Base64 Encode`, () => {
    const encoded = base64Encode(`sample`);
    expect(encoded).toBe(`c2FtcGxl`);
  });

  test(`Base64 Decode`, () => {
    const decoded = base64Decode(`c2FtcGxl`);
    expect(decoded).toBe(`sample`);
  });

  test(`URL-Safe Base64 Encode`, () => {
    const encoded = urlSafeBase64Encode(`sample/url?arg1=hello+world`);
    expect(encoded).toBe(`c2FtcGxlL3VybD9hcmcxPWhlbGxvK3dvcmxk`);
  });

  test(`URL-Safe Base64 Decode`, () => {
    let decoded = urlSafeBase64Decode(`c2FtcGxlL3VybD9hcmcxPWhlbGxvK3dvcmxk`);
    expect(decoded).toBe(`sample/url?arg1=hello+world`);

    decoded = urlSafeBase64Decode(`c2FtcGxlL3VybD9hcmcxPWhlbGxvK3dva`);
    expect(decoded).toBe(`sample/url?arg1=hello+wo`);
  });
});
