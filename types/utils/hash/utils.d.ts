export declare function utf8Encode(str: any): string;
export declare function utf8Decode(str: any): string;
/**
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
export declare function safe_add(x: any, y: any): number;
/**
 * Bitwise rotate a 32-bit number to the left.
 */
export declare function bit_rol(num: any, cnt: any): number;
/**
 * Convert a raw string to a hex string
 */
export declare function rstr2hex(input: any, hexCase?: any): string;
/**
 * Encode a string as utf-16
 */
export declare function str2rstr_utf16le(input: any): string;
export declare function str2rstr_utf16be(input: any): string;
/**
 * Convert an array of big-endian words to a string
 */
export declare function binb2rstr(input: any): string;
/**
 * Convert an array of little-endian words to a string
 */
export declare function binl2rstr(input: any): string;
/**
 * Convert a raw string to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 */
export declare function rstr2binl(input: any): any[];
/**
 * Convert a raw string to an array of big-endian words
 * Characters >255 have their high-byte silently ignored.
 */
export declare function rstr2binb(input: any): any[];
/**
 * Convert a raw string to an arbitrary string encoding
 */
export declare function rstr2any(input: any, encoding: any): any;
/**
 * Convert a raw string to a base-64 string
 */
export declare function rstr2b64(input: any, b64pad?: string): string;
