# alioss-web-uploader

用于在浏览器端直传文件到阿里 OSS

[在线 DEMO](https://unpkg.com/alioss-web-uploader/example/index.html)

## 兼容性

理论上支持 FormData API 的浏览器都可以。兼容性见： [https://caniuse.com/#feat=mdn-api_formdata](https://caniuse.com/#feat=mdn-api_formdata)

IE 系列因不支持 `xhr.upload` 属性，所以 `onProgress` 上传进度回调不可用

更多浏览器支持可参阅相关官方文档提供的方案： [JavaScript客户端签名直传](https://help.aliyun.com/document_detail/31925.html)

## 安装
```bash
yarn add alioss-web-uploader
```
or

```npm
npm install alioss-web-uploader
```

## 使用

### oss(options)
__options__：
* accessKeyId {String}
* accessKeySecret {String}
* bucket {String} the bucket you want to access
* [stsToken] {String} used by temporary authorization, detail [see](https://www.alibabacloud.com/help/doc-detail/32077.htm)
* [endpoint] {String} oss region domain. It takes priority over region.
* [region] {String} default `oss-cn-hangzhou`, see [Data Regions](https://github.com/ali-sdk/ali-oss#data-regions)
* [secure] {Boolean} default undefined. 默认会根据 `location.protocol` 自动选择是否使用 https 。一般不需要设置，除非需要在 http 页面中使用 https 上传。 **注意：不要在 HTTPS 页面中设置为 `false`**（设置了也没用）
* [timeout] {Number} default 300_000
* ~~[cname] {String} default false, access oss with custom domain name. if true, you can fill endpoint field with your custom domain name~~
* [internal] {Boolean} default false
  
参数详情查看 [配置项](https://help.aliyun.com/document_detail/64095.html).

```
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
添加object

参数:
* name {string} 对象名称
* file {File|Blob} 上传的 Blob 或 html5 File
* [options] {Object} 可选参数
  * [timeout] {Number} 超时时间，单位 ms, 默认 `client.opts.timeout` 300s
  * [policy] {Object|String} policy对象或 json 字符串的 base64
  * [signature] {String} policyBase64签名，通常不需要传，因为会自动计算签名
  * [x-oss-object-acl] {String} 指定OSS创建Object时的访问权限。合法值：public-read、private、public-read-write
  * [x-oss-meta-*] 用户指定的user meta值。
  * [x-oss-*] 
  * [更多参数](https://help.aliyun.com/document_detail/31988.html)

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

__在浏览器中直接使用__ 见 `example` 文件夹

#### .generateObjectUrl(name[, baseUrl])
获取对象 url.

参数:
* name {String} 对象名称
* [baseUrl] {String} 如果提供 `baseUrl`， 将会使用 `baseUrl` 代替默认的 `bucket` 和 `endpoint`

```js
client.generateObjectUrl('hello/world.txt');
// => http://${bucketname}.${endpoint}hello/world.txt

client.generateObjectUrl('hello/world.txt', 'http://mycdn.domain.com');
// => http://mycdn.domain.com/hello/world.txt
```

## 参考
* [阿里云 OSS SDK](https://github.com/ali-sdk/ali-oss)

## TODO(maybe)

- [ ] signatureUrl 
- [ ] putObject
- [ ] iframe upload
