/**
 * This file is copied from https://github.com/react-component/upload/blob/master/src/request.js
 * Thanks the authors.
 */

export type UploadProgressEvent = ProgressEvent & {percent: number};

export interface RequestResult {
  status: number;
  statusText: string;
  data: any,
  headers: any,
  xhr: XMLHttpRequest,
}

export interface RequestOptions {
  onProgress?: (e: UploadProgressEvent) => void;
  onError: (error, body?: object) => void;
  // onSuccess: (body: object, xhr: XMLHttpRequest) => void;
  onSuccess: (result, xhr: XMLHttpRequest) => void;
  data: Document | BodyInit | null;
  // filename?: string; // XXX
  // file?: File;  // XXX
  withCredentials?: boolean;
  // action: string;
  headers?:object;
  method?: string;
  timeout?: number;
}

type RequestError = Error & {status?: number; method?: string; url?: string; code?:string};

function getError(url, option, xhr) {
  const codePart = xhr.response.match(/<Code>(.+)<\/Code>/);
  // const messagePart = xhr.response.match(/<Message>(.+)<\/<Message>>/);

  const method = option.method || 'GET';
  const msg = `[${xhr.status}] ${method} ${url}: ${codePart && codePart[1] || ''}`;
  const err: RequestError = new Error(msg);
  err.status = xhr.status;
  err.method = method;
  err.code = codePart && codePart[1] || '';
  err.url = url;
  return err;
}

function getBody(xhr) {
  const text = xhr.responseText || xhr.response;
  if (!text) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

export default function request (url: string, options: RequestOptions) {
  const xhr = new XMLHttpRequest();

  xhr.timeout = options.timeout || 60_000;

  if (options.onProgress && xhr.upload){
    xhr.upload.onprogress = function progress(e: UploadProgressEvent) {
      if (e.total > 0) {
        e.percent = e.loaded / e.total * 100;
      }
      options.onProgress(e);
    }
  }

  /*
  const formData = new FormData();
  if (options.data){
    Object.keys(options.data).forEach(key => {
      formData.append(key, options.data[key]);
    })
  }
  formData.append(options.filename, options.file);
  */

  xhr.onerror = function (e) {
    options.onError(e);
  };

  xhr.onload = function onload() {
    if (xhr.status < 200 || xhr.status >= 300) {
      return options.onError(getError(url, options, xhr), getBody(xhr));
    }
    const result = {
      status: xhr.status,
      statusText: xhr.statusText,
      xhr,
      data: getBody(xhr),
    };
    options.onSuccess(result, xhr);
  };

  xhr.ontimeout = function timeout(ev){
    const err: Error = new Error(`Request timeout, limit ${xhr.timeout} ms.`);
    options.onError(err);
  };

  /*
  xhr.onabort = function timeout(e){
    options.onError(e);
  };
  */

  xhr.open(options.method || 'get', url, true);


  if (options.withCredentials && 'withCredentials' in xhr) {
    xhr.withCredentials = true;
  }

  const headers = options.headers || {};

  if (headers['X-Requested-With'] !== null) {
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  }

  for (const h in headers){
    if (headers.hasOwnProperty(h) && headers[h] !== null){
      xhr.setRequestHeader(h, headers[h]);
    }
  }
  // xhr.send(formData);
  xhr.send(options.data || null);

  return {
    abort() {
      xhr.abort();
    },
  }
}
