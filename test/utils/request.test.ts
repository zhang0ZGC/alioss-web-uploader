import request, {RequestOptions} from "../../src/utils/request";
import sinon, {SinonFakeXMLHttpRequest} from "sinon";

let xhr: sinon.SinonFakeXMLHttpRequestStatic;
let requests: SinonFakeXMLHttpRequest[];

const emptyFunc = (ret?) => {};
const getInitialOptions = (): RequestOptions => ({
  onSuccess: emptyFunc,
  onError: emptyFunc,
});
let options: RequestOptions = getInitialOptions();

describe("request", () => {
  beforeEach(() => {
    xhr = sinon.useFakeXMLHttpRequest();
    // console.log(xhr.onCreate, XMLHttpRequest);
    requests = [];

    xhr.onCreate = req => {
      requests.push(req);
    }
  });

  beforeEach(() => {
    options = getInitialOptions();
  });

  afterEach(() => {
    xhr.restore();
  });

  it('2xx should be success', done => {
    options.onError = done;
    options.onSuccess = ret => {

      done();
    };

    request('test.do', options);

    requests[0].respond(204, {}, '');
  });

  it('40x with should be error', done => {
    options.onError = e => {
      // expect(e.toString()).toContain('[404]');
      expect(e.message).toEqual('NoSuchBucket: The specified bucket does not exist.');
      expect(e.code).toEqual('NoSuchBucket');
      done();
    };
    options.onSuccess = () => done('404 should throw error');
    request('test.do', options);
    const content = {
      400: `\
<?xml version="1.0" encoding="UTF-8"?>
<Error>
  <Code>InvalidDigest</Code>
  <Message>The Content-MD5 you specified was invalid.</Message>
  <RequestId>5DBA7FE2EB71503637C977A7</RequestId>
  <HostId>test.oss-cn-shanghai.aliyuncs.com</HostId>
  <Content-MD5>MSCk1tc8GdyqH5gUcy/SsA==</Content-MD5>
</Error>`
      ,
      404: `\
<?xml version="1.0" encoding="UTF-8"?>
<Error>
  <Code>NoSuchBucket</Code>
  <Message>The specified bucket does not exist.</Message>
  <RequestId>5DCE6635B9A838383044B4C1</RequestId>
  <HostId>test.oss-cn-shanghai.aliyuncs.com</HostId>
  <BucketName>test</BucketName>
</Error>`
    };
    requests[0].respond(404, {}, content[404])
  });

  it('50x with simple text', done => {
    options.onError = e => {
      expect(e.status).toEqual(500);
      expect(e.message).toEqual('');
      expect(e.code).toEqual('');
      done();
    };
    options.onSuccess = () => done('50x should throw error');
    request('test.do', options);
    const content = 'Server 500';
    requests[0].respond(500, {}, content)
  });

  it('upload should be success', done => {
    const data = new FormData();
    data.append('key', 'foo/bar.jpg');
    data.append('signature', 'sfasdshgfdsfkjnb4i5sfkjvn');
    data.append('file', new File(['hello world'], 'test.txt', {type: 'text/plain'}));
    options.data = data;
    options.method = 'POST';
    options.onSuccess = () => done();
    options.onError = () => done('upload should be success');

    request('test.do', options);
    requests[0].respond(240, {}, '');
  });

  it('upload progress works', done => {
    const data = new FormData();
    data.append('key', 'foo/bar.jpg');
    data.append('signature', '123456879156');
    data.append('file', new File(['hello world'], 'test.txt', {type: 'text/plain'}));
    options.data = data;
    options.method = 'POST';
    options.onProgress = e => {
      expect(e.percent).toBeDefined();
      // console.log(e.percent);
    };
    options.onSuccess = () => done();
    options.onError = () => done('upload should be success');

    request('test.do', options);
    requests[0].respond(240, {}, '');
  });

  it("network error should cause error", done => {
    options.onError = e => {
      // console.log(e);
      done();
    };
    options.onSuccess = () => done('Network error should cause error!');

    request('test.do', options);
    requests[0].error();
  });

  it("timeout should cause error", done => {
    options.timeout = 10;
    options.onError = (e: Error) => {
      expect(e.message).toEqual('Request timeout, limit 10 ms.');
      done();
    };
    options.onSuccess = () => done('Timeout error should cause error with timeout!');

    request('test.do', options);
    // @ts-ignore
    requests[0].triggerTimeout();
  });

  it('abort request', done => {
    options.onAbort = () => {
      done();
    };
    options.onSuccess = options.onError = () => done('abort should call onAbort');
    const req = request('test.do', options);
    req.abort();
  });

  it('request headers', function () {
    options.headers = {hello: 'world'};

    request('test.do', options);
    expect(requests[0].requestHeaders).toEqual({
      "Content-Type": "text/plain;charset=utf-8",
      'X-Requested-With': 'XMLHttpRequest',
      hello: 'world',
    });

    options.headers = {'X-Requested-With': null, hello: 'world'};
    request('test.do', options);
    expect(requests[1].requestHeaders).toEqual({
      "Content-Type": "text/plain;charset=utf-8",
      hello: 'world',
    });

    options.data = new FormData();
    request('test.do', options);
    expect(requests[2].requestHeaders).toEqual({
      hello: 'world',
    });
  });

  it('withCredentials', function () {
    request('test.do', options);

    options.withCredentials = true;
    request('test.do', options);

    expect(requests[0].withCredentials).toBeFalsy();
    expect(requests[1].withCredentials).toBeTruthy();
  });
});
