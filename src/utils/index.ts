/**
 * remove ^\/+
 * @param name
 */
export function objectName(name: string) {
  return name.replace(/^\/+/, '');
}

export function escapeName(name: string) {
  return encodeURIComponent(name).replace(/%2F/g, '/');
}

export function isHttpsProtocol() {
  return location && location.protocol === 'https:';
}

/*
export function setRegion(region: string, secure: boolean, internal?: boolean) {
  // const protocol = secure ? 'https//' : 'http://';
  return `http${secure?'s':''}://${region}.aliyuncs.com`;
  // const suffix = internal ? '-internal.aliyuncs.com' : '.aliyuncs.com';
  // return protocol + region + suffix;
}
*/

export function typeOf(object: any) {
  return Object.prototype.toString.call(object).slice(8, -1).toLocaleLowerCase();
}
