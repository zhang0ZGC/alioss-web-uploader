import AliOSSUploader from "../src";

const defaultOptions = {
  region: 'oss-cn-hangzhou',
  accessKeyId: 'testKeyId',
  accessKeySecret: 'testKeySecret',
  bucket: 'test-bucket',
};

describe("Client test", () => {
  beforeAll(() => {
    Object.assign(global, {location: {protocol: 'http:'}});
  });

  it("generateObjectUrl", () => {
    let client;

    client = new AliOSSUploader(defaultOptions);
    expect(client.generateObjectUrl('foo.jpg'))
      .toBe('http://test-bucket.oss-cn-hangzhou.aliyuncs.com/foo.jpg');
    expect(client.generateObjectUrl('foo/bar.jpg'))
      .toBe('http://test-bucket.oss-cn-hangzhou.aliyuncs.com/foo/bar.jpg');
    expect(client.generateObjectUrl('foo/中文.jpg'))
      .toBe('http://test-bucket.oss-cn-hangzhou.aliyuncs.com/foo/%E4%B8%AD%E6%96%87.jpg');
    expect(client.generateObjectUrl('foo/bar.jpg', 'https://my.cdn.com'))
      .toBe('https://my.cdn.com/foo/bar.jpg');

    client = new AliOSSUploader({
      ...defaultOptions,
      secure: true,
    });
    expect(client.generateObjectUrl('foo.jpg'))
      .toBe('https://test-bucket.oss-cn-hangzhou.aliyuncs.com/foo.jpg');
  });
});
