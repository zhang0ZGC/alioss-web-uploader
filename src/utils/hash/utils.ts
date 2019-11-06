// unescape(encodeURIComponent(str))
export function utf8Encode(str) {
  return unescape(encodeURIComponent(str));
}
/*
export function utf8Encode(str) {
  let x, y, output = '',
    i = -1,
    l;

  if (str && str.length) {
    l = str.length;
    while ((i += 1) < l) {
      /!* Decode utf-16 surrogate pairs *!/
      x = str.charCodeAt(i);
      y = i + 1 < l ? str.charCodeAt(i + 1) : 0;
      if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
        x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
        i += 1;
      }
      /!* Encode output as utf-8 *!/
      if (x <= 0x7F) {
        output += String.fromCharCode(x);
      } else if (x <= 0x7FF) {
        output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F),
          0x80 | (x & 0x3F));
      } else if (x <= 0xFFFF) {
        output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
          0x80 | ((x >>> 6) & 0x3F),
          0x80 | (x & 0x3F));
      } else if (x <= 0x1FFFFF) {
        output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
          0x80 | ((x >>> 12) & 0x3F),
          0x80 | ((x >>> 6) & 0x3F),
          0x80 | (x & 0x3F));
      }
    }
  }
  return output;
}
*/

// decodeURIComponent(escape(str))
export function utf8Decode(str) {
  return decodeURIComponent(escape(str));
}
/*
export function utf8Decode(str) {
  let i, ac, c1, c2, c3, arr = [],
    l;
  i = ac = c1 = c2 = c3 = 0;

  if (str && str.length) {
    l = str.length;
    str += '';

    while (i < l) {
      c1 = str.charCodeAt(i);
      ac += 1;
      if (c1 < 128) {
        arr[ac] = String.fromCharCode(c1);
        i += 1;
      } else if (c1 > 191 && c1 < 224) {
        c2 = str.charCodeAt(i + 1);
        arr[ac] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = str.charCodeAt(i + 1);
        c3 = str.charCodeAt(i + 2);
        arr[ac] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
  }
  return arr.join('');
}
*/

/**
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
export function safe_add(x, y) {
  var lsw = (x & 0xFFFF) + (y & 0xFFFF),
    msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/**
 * Bitwise rotate a 32-bit number to the left.
 */
export function bit_rol(num, cnt) {
  return (num << cnt) | (num >>> (32 - cnt));
}

/**
 * Convert a raw string to a hex string
 */
export function rstr2hex(input, hexCase?) {
  var hex_tab = hexCase ? '0123456789ABCDEF' : '0123456789abcdef',
    output = '',
    x, i = 0,
    l = input.length;
  for (; i < l; i += 1) {
    x = input.charCodeAt(i);
    output += hex_tab.charAt((x >>> 4) & 0x0F) + hex_tab.charAt(x & 0x0F);
  }
  return output;
}

/**
 * Encode a string as utf-16
 */
export function str2rstr_utf16le(input) {
  var i, l = input.length,
    output = '';
  for (i = 0; i < l; i += 1) {
    output += String.fromCharCode(input.charCodeAt(i) & 0xFF, (input.charCodeAt(i) >>> 8) & 0xFF);
  }
  return output;
}

export function str2rstr_utf16be(input) {
  var i, l = input.length,
    output = '';
  for (i = 0; i < l; i += 1) {
    output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF, input.charCodeAt(i) & 0xFF);
  }
  return output;
}

/**
 * Convert an array of big-endian words to a string
 */
export function binb2rstr(input) {
  var i, l = input.length * 32,
    output = '';
  for (i = 0; i < l; i += 8) {
    output += String.fromCharCode((input[i >> 5] >>> (24 - i % 32)) & 0xFF);
  }
  return output;
}

/**
 * Convert an array of little-endian words to a string
 */
export function binl2rstr(input) {
  var i, l = input.length * 32,
    output = '';
  for (i = 0; i < l; i += 8) {
    output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
  }
  return output;
}

/**
 * Convert a raw string to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 */
export function rstr2binl(input) {
  var i, l = input.length * 8,
    output = Array(input.length >> 2),
    lo = output.length;
  for (i = 0; i < lo; i += 1) {
    output[i] = 0;
  }
  for (i = 0; i < l; i += 8) {
    output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
  }
  return output;
}

/**
 * Convert a raw string to an array of big-endian words
 * Characters >255 have their high-byte silently ignored.
 */
export function rstr2binb(input) {
  var i, l = input.length * 8,
    output = Array(input.length >> 2),
    lo = output.length;
  for (i = 0; i < lo; i += 1) {
    output[i] = 0;
  }
  for (i = 0; i < l; i += 8) {
    output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
  }
  return output;
}

/**
 * Convert a raw string to an arbitrary string encoding
 */
export function rstr2any(input, encoding) {
  var divisor = encoding.length,
    remainders = Array(),
    i, q, x, ld, quotient, dividend, output, full_length;

  /* Convert to an array of 16-bit big-endian values, forming the dividend */
  dividend = Array(Math.ceil(input.length / 2));
  ld = dividend.length;
  for (i = 0; i < ld; i += 1) {
    dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
  }

  /**
   * Repeatedly perform a long division. The binary array forms the dividend,
   * the length of the encoding is the divisor. Once computed, the quotient
   * forms the dividend for the next step. We stop when the dividend is zerHashes.
   * All remainders are stored for later use.
   */
  while (dividend.length > 0) {
    quotient = Array();
    x = 0;
    for (i = 0; i < dividend.length; i += 1) {
      x = (x << 16) + dividend[i];
      q = Math.floor(x / divisor);
      x -= q * divisor;
      if (quotient.length > 0 || q > 0) {
        quotient[quotient.length] = q;
      }
    }
    remainders[remainders.length] = x;
    dividend = quotient;
  }

  /* Convert the remainders to the output string */
  output = '';
  for (i = remainders.length - 1; i >= 0; i--) {
    output += encoding.charAt(remainders[i]);
  }

  /* Append leading zero equivalents */
  full_length = Math.ceil(input.length * 8 / (Math.log(encoding.length) / Math.log(2)));
  for (i = output.length; i < full_length; i += 1) {
    output = encoding[0] + output;
  }
  return output;
}

/**
 * Convert a raw string to a base-64 string
 */
export function rstr2b64(input, b64pad='=') {
  const tab = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '',
    len = input.length,
    i, j, triplet;

  for (i = 0; i < len; i += 3) {
    triplet = (input.charCodeAt(i) << 16) | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
    for (j = 0; j < 4; j += 1) {
      if (i * 8 + j * 6 > input.length * 8) {
        output += b64pad;
      } else {
        output += tab.charAt((triplet >>> 6 * (3 - j)) & 0x3F);
      }
    }
  }
  return output;
}
