# alioss-web-uploader
[![NPM version](https://img.shields.io/npm/v/alioss-web-uploader.svg)](https://www.npmjs.com/package/alioss-web-uploader)
[![min size](https://img.shields.io/bundlephobia/min/alioss-web-uploader)](https://unpkg.com/browse/alioss-web-uploader/dist/)
[![min+gzip size](https://img.shields.io/bundlephobia/minzip/alioss-web-uploader)](https://unpkg.com/alioss-web-uploader/dist/alioss-web-uploader.min.js)

在浏览器端直传文件到阿里 OSS

[在线 DEMO][^demo_online]

## 兼容性

理论上支持 FormData API 的浏览器都可以(IE 10+)。详细兼容性见： [https://caniuse.com/#feat=mdn-api_formdata](https://caniuse.com/#feat=mdn-api_formdata)

> 更多浏览器支持可参阅相关官方文档提供的方案： [JavaScript客户端签名直传](https://help.aliyun.com/document_detail/31925.html)

## 安装

### 使用 yarn 或 npm 安装
```shell script
yarn add alioss-web-uploader
```

```shell script
npm install alioss-web-uploader
```

### 浏览器直接引入
在浏览器使用 `script` 标签直接引入 js 文件， 并使用全局变量 `AliOSSWebUploader`。

发布包内 `dist` 目录提供了 `alioss-web-uploader.js` 及 `alioss-web-uploader.min.js`。

或者使用公共 CDN：

[![alioss-web-uploader](https://data.jsdelivr.com/v1/package/npm/alioss-web-uploader/badge)](https://www.jsdelivr.com/package/npm/alioss-web-uploader)
> https://cdn.jsdelivr.net/npm/alioss-web-uploader/dist/alioss-web-uploader.min.js

[UNPKG](https://unpkg.com/alioss-web-uploader/dist/)
> https://unpkg.com/alioss-web-uploader/dist/alioss-web-uploader.min.js

## 使用

### oss(options)
__options__：
* accessKeyId {String}
* accessKeySecret {String}
* **[bucket]?** {String} Bucket 名称，选择性必填，必须与 `region` 同时指定。
* **[region]?** {String} 地域，默认 `oss-cn-hangzhou` , 详情 [Data Regions](https://github.com/ali-sdk/ali-oss#data-regions)
* **[endpoint]?** {String} 与bucket绑定的自定义域名，如果指定则忽略 `bucket` 及 `region` 设置，前面不加 `http(s)://`。
* [stsToken] {String} used by temporary authorization, 强烈建议使用此参数, [查看详情](https://www.alibabacloud.com/help/doc-detail/32077.htm)
* [secure] {Boolean} default undefined. 默认会根据 `location.protocol` 自动选择是否使用 https 。一般不需要设置，除非需要在 http 页面中使用 https 上传。 **注意：不要在 HTTPS 页面中设置为 `false`**（设置了也没用，不可以在 https 页面中使用 http）
* [timeout] {Number} 请求超时时间，默认 `300_000` ( 300 s )

[^_^]: # (* [internal] {Boolean} default false)
[^_^]: # (* [cname] {String} default false, access oss with custom domain name. if true, you can fill endpoint field with your custom domain name)

  
参数详情查看 [配置项](https://help.aliyun.com/document_detail/64095.html).

```js
const oss = require('alioss-web-uploader');

// or `const client = oss({...})`
const client = new oss({
    region:'oss-cn-shanghai',
    bucket:'your bucket',
    accessKeyId:'your keyId',
    accessKeySecret: 'your accessKeySecret',
});
```

#### .postObject(name, file[, options])
通过`postObject`接口添加object

参数: object
* name {string} 对象名称
* file {File|Blob} 上传的 Blob 或 html5 File
* [options] {Object} 可选参数
  * [onProgress] {Function} 上传进度回调。(IE 系列因不支持 `xhr.upload` 属性，所以回调不会被执行)
  * [onSuccess] {Function} 成功回调
  * [onError] {Function} 错误回调
  * [onAbort] {Function} 中断上传回调
  * [timeout] {Number} 超时时间，单位 ms, 默认 `client.opts.timeout` 300s
  * [policy] {Object|String} policy 对象或 json 字符串的 base64
  * [signature] {String} policyBase64 签名，通常不需要传，因为会自动计算签名
  * [x-oss-object-acl] {String} 指定 OSS 创建 Object 时的访问权限。合法值：public-read、private、public-read-write
  * [x-oss-meta-*] 用户指定的 user meta 值。
  * [x-oss-*] 
  * [更多参数](https://help.aliyun.com/document_detail/31988.html)
  * [headers] {Object} object header 信息，用以指定下载时的 headers，详情见 [RFC2616][^RFC2616] 
  ([中文][^RFC2616_ZH])
    * 'Cache-Control' cache control for download, e.g.: Cache-Control: public, no-cache
    * 'Content-Disposition' object name for download, e.g.: Content-Disposition: somename
    * 'Content-Encoding' object content encoding for download, e.g.: Content-Encoding: gzip
    * 'Expires' expires time (milliseconds) for download, e.g.: Expires: 3600000
  
返回: object
* abort {Function} 可用于中断上传

```js
const blob = new Blob(['hello world'], {type: 'text/plain'});
const options = {
    'x-oss-object-acl': 'public-read',
    onProgress: e=>console.log(`complete ${e.percent.toFixed(2)}%`),
    onSuccess: () => console.log('upload success'),
    onError: (e) => console.warn(e),
};
const uploader = client.postObject('hello/world.txt', blob, options);
// uploader.abort()
```

__在浏览器中直接使用__ 见 `example` 文件夹或查看 [在线 demo][^demo_online]

#### .generateObjectUrl(name[, baseUrl])
获取对象 url，如果 object 设置的 ACL 权限为 `public-read` 或 `public-read-write`，可通过此 url 直接下载文件。

参数:
* name {String} 对象名称
* [baseUrl] {String} 如果提供 `baseUrl`， 将会使用 `baseUrl` 代替默认的 `bucket` 和 `endpoint`

```js
client.generateObjectUrl('hello/world.txt');
// => http(s)://${bucket}.${region}.aliyuncs.com/hello/world.txt
// => http(s)://${endpoint}/hello/world.txt (if endpoint is provided )

client.generateObjectUrl('hello/world.txt', 'http://mycdn.domain.com');
// => http://mycdn.domain.com/hello/world.txt
```

## 参考
* [阿里云 OSS SDK](https://github.com/ali-sdk/ali-oss)

## TODO(maybe)

- [ ] signatureUrl 
- [ ] putObject
- [ ] iframe upload

[^demo_online]: https://unpkg.com/alioss-web-uploader/example/index.html
[^RFC2616]: http://www.w3.org/Protocols/rfc2616/rfc2616.html
[^RFC2616_ZH]: https://www.cnblogs.com/k1988/archive/2010/01/12/2165683.html
