export declare function buildCanonicalizedResource(resourcePath: string, parameters: string | string[] | {
    [key: string]: any;
}): string;
export declare function buildCanonicalString(method: string, resourcePath: string, request?: any, expires?: any): string;
export declare function computeSignature(accessKeySecret: string, canonicalString: string): any;
export declare function authorization(accessKeyId: string, accessKeySecret: string, canonicalString: string): string;
