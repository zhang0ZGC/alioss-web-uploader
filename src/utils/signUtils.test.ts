import {authorization, buildCanonicalizedResource, buildCanonicalString, computeSignature} from "./signUtils";

describe("signUtils", () => {
  it("buildCanonicalizedResource", () => {
    const func = buildCanonicalizedResource;
    expect(func('/test.do', 'a=1&b=3')).toBe('/test.do?a=1&b=3');
    expect(func('/test.do', 'b=3&a=1')).toBe('/test.do?b=3&a=1');
    expect(func('/test.do', ['b=3', 'a=1'])).toBe('/test.do?a=1&b=3');
    expect(func('/test.do', {c: 12, a:1, b:3, aa: undefined})).toBe('/test.do?a=1&aa&b=3&c=12');
  });

  it('computeSignature ', function () {
    const text = `PUT
eB5eJF1ptWaXm4bijSPyxw==
text/html
Thu, 17 Nov 2005 18:49:58 GMT
x-oss-magic:abracadabra
x-oss-meta-author:foo@bar.com
oss-example/nel`;
    const testAccessKey = 'asdf4d4pFjA7Sw3dxhD78Bw21sc5quhb8156';
    const testSecret = 'OtxrzxIsfpFjA7Sw3dxhD78Bw21TLhquhboDYROV';
    expect(computeSignature(testSecret, text)).toBe('oQKg+b/L4TNclcTiAA+u8o5C7N0=');
    expect(authorization(testAccessKey, testSecret, text)).toBe(`OSS ${testAccessKey}:oQKg+b/L4TNclcTiAA+u8o5C7N0=`);
  });

  it('buildCanonicalString', function () {
    const func = buildCanonicalString;
    const date = new Date().toUTCString();
    const expected = [
      `PUT
testmd5
application/json
${date}
x-oss-date:${date}
/test.do`,
      `PUT
testmd5
application/octet-stream
${date}
x-oss-abc:testheader
x-oss-date:${date}
/test.do?a=1&b=123`,
      `PUT
application/octet-stream
${date}
x-oss-abc:testheader
x-oss-date:${date}
/test.do?a=1&b=123`
    ];

    expect(func('PUT', '/test.do', {
      headers: {
        'Content-Md5' : 'testmd5',
        'Content-Type': 'application/json',
        'x-oss-date': date,
      }
    })).toBe(expected[0]);

    expect(func('PUT', '/test.do', {
      headers: {
        'Content-Md5' : 'testmd5',
        'Content-Type': 'application/octet-stream',
        'x-oss-date': date,
        'x-oss-abc': 'testheader',
      },
      params: {
        b: 123,
        a: 1
      },
    })).toBe(expected[1]);
  });
});
