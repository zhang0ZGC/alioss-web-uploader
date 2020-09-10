import sinon from "sinon";
import Client from "../src";
import {ClientOptions, PostObjectOptions} from "../src/Client";


const defaultOptions = {
  region: 'oss-cn-hangzhou',
  accessKeyId: 'testKeyId',
  accessKeySecret: 'testKeySecret',
  bucket: 'test-bucket',
};
let xhr: sinon.SinonFakeXMLHttpRequestStatic;
let requests: sinon.SinonFakeXMLHttpRequest[];

describe("Client test", () => {
  it("generateObjectUrl", () => {
    let client;

    client = new Client(defaultOptions);
    expect(client.generateObjectUrl('foo.jpg'))
      .toBe('http://test-bucket.oss-cn-hangzhou.aliyuncs.com/foo.jpg');
    expect(client.generateObjectUrl('foo/bar.jpg'))
      .toBe('http://test-bucket.oss-cn-hangzhou.aliyuncs.com/foo/bar.jpg');
    expect(client.generateObjectUrl('foo/中文.jpg'))
      .toBe('http://test-bucket.oss-cn-hangzhou.aliyuncs.com/foo/%E4%B8%AD%E6%96%87.jpg');
    expect(client.generateObjectUrl('foo/bar.jpg', 'https://my.cdn.com'))
      .toBe('https://my.cdn.com/foo/bar.jpg');
    expect(client.generateObjectUrl('foo/bar.jpg', 'https://my.cdn.com/'))
      .toBe('https://my.cdn.com/foo/bar.jpg');

    client = new Client({
      ...defaultOptions,
      secure: true,
    });
    expect(client.generateObjectUrl('foo.jpg'))
      .toBe('https://test-bucket.oss-cn-hangzhou.aliyuncs.com/foo.jpg');
  });

  describe("postObject test", () => {
    let clientOptions: typeof defaultOptions;
    const file = new File(['1234567890'], 'foo.jpg', { type: 'text/plain'});
    beforeEach(() => {
      clientOptions = { ...defaultOptions };

      xhr = sinon.useFakeXMLHttpRequest();
      requests = [];

      xhr.onCreate = req => {
        requests.push(req);
      }
    });
    afterEach(() => {
      xhr.restore();
    });

    it('upload success', () => {
      let client = new Client(clientOptions);
      client.postObject(file.name, file);
      const request = requests[0];
      request.respond(204, {}, '');
      expect(request.url).toBe(`http://${clientOptions.bucket}.${clientOptions.region}.aliyuncs.com`);
    });

    it('upload success with callback', done => {
      let client = new Client(clientOptions);
      client.postObject(file.name, file, {
        onSuccess: result => {
          done()
        }
      });
      requests[0].respond(204, {}, '');
    });

    it('upload progress', done => {
      let client = new Client(clientOptions);
      client.postObject(file.name, file, {
        onProgress: e => {
          expect(e.percent).toBeDefined();
          done();
        },
      });
      requests[0].respond(204, {}, '');
    });

    it('upload error with default console.error', done => {
      console.error = msg => {
        expect(msg.status).toEqual(400);
        done();
      };
      let client = new Client(clientOptions);
      client.postObject(file.name, file);

      requests[0].respond(400, {}, '');
    });

    it('upload with other options', function () {
      let options: PostObjectOptions;
      let requestBody: FormData;
      const clientOptions = {
        ...defaultOptions,
        stsToken: 'sfasfasdf2354qafcasdt4wt',
      };
      const client = new Client(clientOptions);

      options = {
        headers: {
          'Content-Disposition': file.name,
        },
      };
      client.postObject(file.name, file, options);
      requestBody = requests[0].requestBody as unknown as FormData;
      expect(requestBody.get('Content-Disposition')).toBeDefined();
      expect(requestBody.get('Content-Disposition')).toBe(file.name);
      expect(requestBody.get('x-oss-security-token')).toBe(clientOptions.stsToken);

      options = {
        policy: `eyJleHBpcmF0aW9uIjoiMjAxOS0xMS0xNlQwOTo1NToxMy41NDJaIiwiY29uZGl0aW9ucyI6W3siYnVja2V0Ijo\
idGVzdD0tYnVja2V0In0seyJrZXkiOiJmb28uanBnIn0sWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsMCwxMDczNzQxODI0XV19`,
        'success_action_status': 200,
        'x-oss-meta-filename': file.name,
        // ...
      };
      client.postObject(file.name, file, options);
      requestBody = requests[1].requestBody as unknown as FormData;
      expect(requestBody.get('success_action_status')).toBe(options['success_action_status'].toString());
      expect(requestBody.get('x-oss-meta-filename')).toBe(options['x-oss-meta-filename']);
    });

    it('upload with dir', function () {
      let requestBody;
      const client = new Client(defaultOptions);

      // # 1
      client.postObject(file.name, file, {
        dir: 'bar',
      })
      requestBody = requests[0].requestBody as unknown as FormData;
      expect(requestBody.get('key')).toBe('bar/foo.jpg');

      // #2
      client.postObject(file.name, file, {
        dir: 'foo/bar/',
      })
      requestBody = requests[1].requestBody as unknown as FormData;
      expect(requestBody.get('key')).toBe('foo/bar/foo.jpg');

      // #3
      client.postObject(file.name, file, {
        dir: '/foo/bar//',
      })
      requestBody = requests[2].requestBody as unknown as FormData;
      expect(requestBody.get('key')).toBe('foo/bar/foo.jpg');
    })
  });

  it('initial test', () => {
    // common
    expect(new Client(defaultOptions)).toBeInstanceOf(Client);

    // Function mode
    // @ts-ignore
    expect(Client(defaultOptions)).toBeInstanceOf(Client);

    // other options
    expect(new Client({...defaultOptions, endpoint: 'other.oss-cn-hangzhou.aliyuncs.com'}).generateObjectUrl('foo.bar'))
      .toBe('http://other.oss-cn-hangzhou.aliyuncs.com/foo.bar');
    expect(new Client({...defaultOptions, internal: true}).generateObjectUrl('foo.bar'))
      .toBe('http://test-bucket.oss-cn-hangzhou-internal.aliyuncs.com/foo.bar');

    // lack some options
    const errorConstruct = (options?: ClientOptions) => {
      // @ts-ignore
      new Client(options);
    };
    const requireMsg = 'require endpoint or region/bucket in options';
    expect(() => errorConstruct()).toThrowError(requireMsg);
    expect(() => errorConstruct({ ...defaultOptions, region: null })).toThrowError(requireMsg);
    expect(() => errorConstruct({ ...defaultOptions, bucket: null })).toThrowError(requireMsg);
    expect(() => errorConstruct({ ...defaultOptions, bucket: null, region: null })).toThrowError(requireMsg);
  });
});
