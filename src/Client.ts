import {objectName, typeOf} from "@/utils";
import {SHA1} from "@/utils/hash";
import {rstr2b64, utf8Encode} from "@/utils/hash/utils";
import request from "@/utils/request";

function getOssParams(params){
  const out = {};
  Object.keys(params).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.substr(0, 6) === 'x-oss-'){
      out[lowerKey] = params[key];
    }
  });
  return out;
}

interface ClientOptions {
  /**
   * access key you create on aliyun console website
   */
  accessKeyId: string;
  /**
   * access secret you create
   */
  accessKeySecret: string;
  bucket: string;
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
  region?: string;
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
  isRequestPay?: boolean;
}


class Client {
  protected opts: ClientOptions & { host: string };

  constructor(options: ClientOptions) {
    if (!(this instanceof Client)) {
      return new Client(options);
    }
    if (!options.bucket) {
      throw new Error('bucket is required.');
    }
    const opts = {
      endpoint: null,
      region: 'oss-cn-hangzhou',
      timeout: 60_000,
      internal: false,
      cname: false,
      secure: false,
      ...options,
      host: '',
    };
    if (opts.endpoint) {

    } else if (opts.region) {
      opts.endpoint = opts.bucket;
      if (opts.internal) opts.endpoint += '-internal';
      opts.endpoint += `.${opts.region}.aliyuncs.com`
    } else {
      throw new Error('require options.endpoint or options.region');
    }
    opts.host = `http${opts.secure?'s':''}://${opts.endpoint}`;
    this.opts = opts;
  }

  public putObject(name, file: File|BlobPart, options){

  }

  /**
   * 以传统表单形式上传文件
   * @param name
   * @param file
   * @param options
   */
  public postObject(name: string, file: File, options:{[key:string]:any}={}) {
    if (!options.policy) options.policy = {};
    let policyBase64;

    const data = new FormData();
    data.append('key', objectName(name));

    if (this.opts.accessKeyId && this.opts.accessKeySecret){
      if (typeOf(options.policy) === 'string'){
        policyBase64 = options.policy;
      } else{
        const policy = {
          "expiration": new Date(+new Date() + 24 * 3600 * 30).toISOString(),
          "conditions": [
            ["content-length-range", 0, 128 * 1024 * 1024],
          ],
          ...options.policy,
        };
        policyBase64 = rstr2b64(utf8Encode(JSON.stringify(policy)));
      }

      const signature = options.signature || new SHA1().b64_hmac(this.opts.accessKeySecret, policyBase64);
      data.append('OSSAccessKeyId', this.opts.accessKeyId);
      data.append('policy', policyBase64);
      data.append('Signature', signature);
    }

    const ossParam = getOssParams(options);
    Object.keys(ossParam).forEach(k => data.append(k, ossParam[k]));

    data.append('file', file);

    const emptyFunc = function(){};
    const reqOptions = {
      method: 'POST',
      data,
      onSuccess: options.onSuccess || emptyFunc,
      onError: options.onError || emptyFunc,
      onProgress: options.onProgress || emptyFunc,
      // withCredentials: true,
    };
    return request(this.opts.host, reqOptions);
  }
}


export default Client;
