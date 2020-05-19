import {escapeName, isHttpsProtocol, objectName} from "./utils";
import {rstr2b64, utf8Encode} from "./utils/hash/utils";
import request, {RequestOptions, RequestResult, UploadProgressEvent} from "./utils/request";
import {computeSignature} from "./utils/signUtils";

function getOssParams(params, extendKeys=[]){
  const out = {};
  Object.keys(params).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (/^x-oss-/.test(lowerKey) || extendKeys.indexOf(key)>-1){
      out[lowerKey] = params[key];
    }
  });
  return out;
}

// @link https://help.aliyun.com/document_detail/31837.html?spm=a2c4g.11186623.2.15.169769cbIq4eNn#concept-zt4-cvy-5db
type Region = 'oss-cn-hangzhou' | 'oss-cn-shanghai' | 'oss-cn-qingdao' | 'oss-cn-beijing' | 'oss-cn-zhangjiakou'
  | 'oss-cn-huhehaote' | 'oss-cn-shenzhen' | 'oss-cn-heyuan' | 'oss-cn-chengdu' | 'oss-cn-hongkong' | 'oss-us-west-1'
  | 'oss-us-east-1' | 'oss-ap-southeast-1' | 'oss-ap-southeast-2' | 'oss-ap-southeast-3' | 'oss-ap-southeast-5'
  | 'oss-ap-northeast-1' | 'oss-ap-south-1' | 'oss-eu-central-1' | 'oss-eu-west-1' | 'oss-me-east-1' | string;

export interface ClientOptions {
  /**
   * access key you create on aliyun console website
   */
  accessKeyId: string;
  /**
   * access secret you create
   */
  accessKeySecret: string;
  bucket?: string;
  /**
   * used by temporary authorization
   */
  stsToken?: string;
  /**
   * oss region domain. It takes priority over `region`
   */
  endpoint?: string;
  /**
   * the bucket data region location, default is `oss-cn-hangzhou`
   */
  region?: Region;
  /**
   * access OSS with aliyun internal network or not, default is false. If your servers are running on aliyun too,
   * you can set true to save lot of money.
   */
  internal?: boolean;
  /**
   * instance level timeout for all operations, default is 60_000(60s).
   */
  timeout?: number;
  secure?: boolean;
  /**
   * default false, access oss with custom domain name. if true, you can fill endpoint field with your custom domain name
   */
  cname?: boolean;
  // isRequestPay?: boolean;
}

export interface PostObjectOptions {
  policy?: string | {[key: string]: any};
  signature?: string;
  timeout?: number;
  onProgress?: (e: UploadProgressEvent) => void;
  onSuccess?: (result: RequestResult) => void;
  onError?: (e: Error) => void;
  onAbort?: () => void;
  success_action_status?: 200|201|204;
  success_action_redirect?: string;
  'x-oss-object-acl'?: 'private' | 'public-read' | 'public-read-write';
  headers?: {[key: string]: string | number},
  [key: string]: any;
}

class Client {
  protected opts: ClientOptions & { host: string };

  constructor(options: ClientOptions) {
    if (!(this instanceof Client)) {
      return new Client(options);
    }
    const opts = {
      endpoint: null,
      region: 'oss-cn-hangzhou',
      timeout: 300_000,
      internal: false,
      // cname: false,
      secure: undefined,
      ...options,
      host: '',
    };
    if (opts.endpoint) {
      // if set custom endpoint
    } else if (opts.region && opts.bucket) {
      opts.endpoint = opts.bucket;
      if (opts.internal) opts.region += '-internal';
      opts.endpoint += `.${opts.region}.aliyuncs.com`
    } else {
      throw new Error('require endpoint or region/bucket in options');
    }
    // 一般情况下不需要设置 `secure` 参数，唯一需要用到的场景可能就是在 http 页面中使用 https 连接了
    opts.host += `http${opts.secure === true || isHttpsProtocol() ? 's' : ''}://${opts.endpoint}`;
    this.opts = opts;
  }

  /*
  public putObject(name, file: File|BlobPart, options){

  }
  */

  /**
   * post object as form/multi-part
   * @param name
   * @param file
   * @param options
   */
  public postObject(name: string, file: File | Blob, options: PostObjectOptions={}) {
    if (!options.policy) options.policy = {};
    let policyBase64;

    const data = new FormData();

    Object.keys(options.headers || {}).forEach(key => {
      data.append(key, options.headers[key].toString());
    });

    data.append('key', objectName(name));

    if (this.opts.accessKeyId && this.opts.accessKeySecret){
      if (typeof options.policy === 'string'){
        policyBase64 = options.policy;
      } else{
        const policy = {
          "expiration": new Date(+new Date() + 24 * 3600 * 1000).toISOString(),
          "conditions": [
            {"bucket": this.opts.bucket},
            {"key": objectName(name)}, // equals to ["eq", "$key", objectName(name)],
            ["content-length-range", 0, 1024 * 1024 * 1024],
          ],
          ...options.policy,
        };
        policyBase64 = rstr2b64(utf8Encode(JSON.stringify(policy)));
      }

      const signature = options.signature || computeSignature(this.opts.accessKeySecret, policyBase64);
      data.append('OSSAccessKeyId', this.opts.accessKeyId);
      data.append('policy', policyBase64);
      data.append('Signature', signature);
      if (this.opts.stsToken){
        data.append('x-oss-security-token', this.opts.stsToken);
      }
    }

    const ossParam = getOssParams(options, ['success_action_status', 'success_action_redirect']);
    Object.keys(ossParam).forEach(k => data.append(k, ossParam[k]));

    data.append('file', file);

    const emptyFunc = function () {};
    const reqOptions: RequestOptions = {
      method: 'POST',
      data,
      timeout: options.timeout || this.opts.timeout,
      onSuccess: options.onSuccess || emptyFunc,
      onError: options.onError || function (e) {
        console.error(e);
      },
      onAbort: options.onAbort || emptyFunc,
      // withCredentials: true,
    };
    if (options.onProgress) reqOptions.onProgress = options.onProgress;
    return request(this.opts.host, reqOptions);
  }

  /**
   * Get the Object url.
   * If provide baseUrl, will use baseUrl instead the default bucket and endpoint .
   * @param name
   * @param baseUrl
   */
  public generateObjectUrl(name: string, baseUrl?: string) {
    if (!baseUrl) {
      baseUrl = this.opts.host + '/';
    } else if (baseUrl[baseUrl.length - 1] !== '/') {
      baseUrl += '/';
    }
    return baseUrl + escapeName(objectName(name));
  }
}


export default Client;
