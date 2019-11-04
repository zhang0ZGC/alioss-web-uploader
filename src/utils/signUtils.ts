import {typeOf} from "./index";
import SHA1 from "./hash/sha1";


export function buildCanonicalizedResource(resourcePath: string, parameters: string|string[]|{[key: string]:any}) {
  let resource = resourcePath;
  let separator = '?';
  const type = typeOf(parameters);

  if (type === 'string' && (<string>parameters).trim() !== '') {
    resource += separator + parameters;
  } else if (type === 'array') {
    (<string[]>parameters).sort();
    resource += separator + (<string[]>parameters).join('&');
  } else if (parameters) {
    const compareFunc = (a, b) => {
      if (a[0] > b[0]) return 1;
      if (a[0] < b[0]) return -1;
      return 0;
    };
    const processFunc = key => {
      resource += separator + key;
      if (parameters[key]) {
        resource += `=${parameters[key]}`;
      }
      separator = '&';
    };
    Object.keys(parameters).sort(compareFunc).forEach(processFunc);
  }
  return resource;
}

export function buildCanonicalString (method: string, resourcePath: string, request?, expires?: any) {
  const headers = request.headers || {};
  const OSS_PREFIX = 'x-oss-';
  const ossHeaders = [];
  const headersToSign = {};

  let signContent = [
    method.toUpperCase(),
    headers['Content-Md5'] || '',
    headers['Content-Type'] || headers['content-type'],
    expires || headers['x-oss-date'],
  ];

  Object.keys(headers).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.indexOf(OSS_PREFIX) === 0) {
      headersToSign[lowerKey] = String(headers[key]).trim();
    }
  });

  Object.keys(headersToSign).sort().forEach(key => {
    ossHeaders.push(`${key}:${headersToSign[key]}`);
  });

  signContent = signContent.concat(ossHeaders);

  signContent.push(buildCanonicalizedResource(resourcePath, request.params));

  return signContent.join("\n");
}

export function computeSignature (accessKeySecret: string, canonicalString: string) {
  return new SHA1().b64_hmac(accessKeySecret, canonicalString);
}

export function authorization (accessKeyId: string, accessKeySecret: string, canonicalString: string) {
  return `OSS ${accessKeyId}:${computeSignature(accessKeySecret, canonicalString)}`;
}
