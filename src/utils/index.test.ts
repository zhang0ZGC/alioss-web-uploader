import {escapeName, isHttpsProtocol, objectName, typeOf} from "./index";

describe("utils test", () => {
  it("objectName test", () => {

    expect(objectName('test.txt')).toBe('test.txt');
    expect(objectName('/a/test.txt')).toBe('a/test.txt');
    expect(objectName('//a/test.txt')).toBe('a/test.txt');
    expect(objectName('a/test.txt')).toBe('a/test.txt');
  });

  it("escapeName test", () => {
    expect(escapeName("foo")).toBe('foo');
    expect(escapeName("foo/bar")).toBe('foo/bar');
    expect(escapeName('foo/中文.test')).toBe('foo/%E4%B8%AD%E6%96%87.test')
  });

  it('isHttpsProtocol', function () {
    Object.assign(global, {location: {protocol: 'http:'}});
    expect(isHttpsProtocol()).toBeFalsy();
    Object.assign(global, {location: {protocol: 'https:'}});
    expect(isHttpsProtocol()).toBeTruthy();
  });

  it('typeOf', function () {
    const types = [
      {type: 'string', value: 'abc'},
      {type: 'number', value: 1},
      {type: 'number', value: 1.2},
      {type: 'number', value: NaN},
      {type: 'number', value: -1},
      {type: 'boolean', value: false},
      {type: 'boolean', value: true},
      {type: 'function', value: ()=>{}},
      {type: 'arraybuffer', value: new ArrayBuffer(16)},
      {type: 'blob', value: new Blob()},
      {type: 'file', value: new File(['123'], 'test.txt')},
      {type: 'symbol', value: Symbol()},
      {type: 'null', value: null},
      {type: 'undefined', value: undefined},
      {type: 'object', value: {}},
      {type: 'regexp', value: /\d+/},
      {type: 'date', value: new Date()},
      {type: 'error', value: new Error()},
    ];

    for (const item of types){
      expect(typeOf(item.value)).toBe(item.type);
    }
  });
});
