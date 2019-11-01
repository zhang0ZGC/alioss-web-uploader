import {rstr2hex, rstr2b64, rstr2any, utf8Encode, binb2rstr, rstr2binb, safe_add, bit_rol} from "./utils";

/**
 * Copy from https://github.com/h2non/jshashes/blob/master/hashes.js
 */

const SHA1 = function SHA1 (options?) {
  /**
   * Private config properties. You may need to tweak these to be compatible with
   * the server-side, but the defaults work in most cases.
   * See {@link Hashes.MD5#method-setUpperCase} and {@link Hashes.SHA1#method-setUpperCase}
   */
  var hexcase = (options && typeof options.uppercase === 'boolean') ? options.uppercase : false, // hexadecimal output case format. false - lowercase; true - uppercase
    b64pad = (options && typeof options.pad === 'string') ? options.pad : '=', // base-64 pad character. Defaults to '=' for strict RFC compliance
    utf8 = (options && typeof options.utf8 === 'boolean') ? options.utf8 : true; // enable/disable utf8 encoding

  // public methods
  this.hex = function (s) {
    return rstr2hex(rstr(s, utf8), hexcase);
  };
  this.b64 = function (s) {
    return rstr2b64(rstr(s, utf8), b64pad);
  };
  this.any = function (s, e) {
    return rstr2any(rstr(s, utf8), e);
  };
  this.raw = function (s) {
    return rstr(s, utf8);
  };
  this.hex_hmac = function (k, d) {
    return rstr2hex(rstr_hmac(k, d));
  };
  this.b64_hmac = function (k, d) {
    return rstr2b64(rstr_hmac(k, d), b64pad);
  };
  this.any_hmac = function (k, d, e) {
    return rstr2any(rstr_hmac(k, d), e);
  };
  /**
   * Perform a simple self-test to see if the VM is working
   * @return {String} Hexadecimal hash sample
   * @public
   */
  /*this.vm_test = function () {
    return hex('abc').toLowerCase() === '900150983cd24fb0d6963f7d28e17f72';
  };*/
  /**
   * @description Enable/disable uppercase hexadecimal returned string
   * @param {boolean} a
   * @return {Object} this
   * @public
   */
  this.setUpperCase = function (a) {
    if (typeof a === 'boolean') {
      hexcase = a;
    }
    return this;
  };
  /**
   * @description Defines a base64 pad string
   * @param {string} Pad
   * @return {Object} this
   * @public
   */
  this.setPad = function (Pad) {
    b64pad = Pad || b64pad;
    return this;
  };
  /**
   * @description Defines a base64 pad string
   * @param {boolean} a
   * @return {Object} this
   * @public
   */
  this.setUTF8 = function (a) {
    if (typeof a === 'boolean') {
      utf8 = a;
    }
    return this;
  };

  // private methods

  /**
   * Calculate the SHA-1 of an array of big-endian words, and a bit length
   */
  function binb(x, len) {
    var i, j, t, olda, oldb, oldc, oldd, olde,
      w = Array(80),
      a = 1732584193,
      b = -271733879,
      c = -1732584194,
      d = 271733878,
      e = -1009589776;

    /* append padding */
    x[len >> 5] |= 0x80 << (24 - len % 32);
    x[((len + 64 >> 9) << 4) + 15] = len;

    for (i = 0; i < x.length; i += 16) {
      olda = a;
      oldb = b;
      oldc = c;
      oldd = d;
      olde = e;

      for (j = 0; j < 80; j += 1) {
        if (j < 16) {
          w[j] = x[i + j];
        } else {
          w[j] = bit_rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
        }
        t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)),
          safe_add(safe_add(e, w[j]), sha1_kt(j)));
        e = d;
        d = c;
        c = bit_rol(b, 30);
        b = a;
        a = t;
      }

      a = safe_add(a, olda);
      b = safe_add(b, oldb);
      c = safe_add(c, oldc);
      d = safe_add(d, oldd);
      e = safe_add(e, olde);
    }
    return Array(a, b, c, d, e);
  }

  /**
   * Calculate the SHA-512 of a raw string
   */
  function rstr(s, utf8?) {
    s = (utf8) ? utf8Encode(s) : s;
    return binb2rstr(binb(rstr2binb(s), s.length * 8));
  }

  /**
   * Calculate the HMAC-SHA1 of a key and some data (raw strings)
   */
  function rstr_hmac(key, data) {
    var bkey, ipad, opad, i, hash;
    key = (utf8) ? utf8Encode(key) : key;
    data = (utf8) ? utf8Encode(data) : data;
    bkey = rstr2binb(key);

    if (bkey.length > 16) {
      bkey = binb(bkey, key.length * 8);
    }
    ipad = Array(16), opad = Array(16);
    for (i = 0; i < 16; i += 1) {
      ipad[i] = bkey[i] ^ 0x36363636;
      opad[i] = bkey[i] ^ 0x5C5C5C5C;
    }
    hash = binb(ipad.concat(rstr2binb(data)), 512 + data.length * 8);
    return binb2rstr(binb(opad.concat(hash), 512 + 160));
  }

  /**
   * Perform the appropriate triplet combination function for the current
   * iteration
   */
  function sha1_ft(t, b, c, d) {
    if (t < 20) {
      return (b & c) | ((~b) & d);
    }
    if (t < 40) {
      return b ^ c ^ d;
    }
    if (t < 60) {
      return (b & c) | (b & d) | (c & d);
    }
    return b ^ c ^ d;
  }

  /**
   * Determine the appropriate additive constant for the current iteration
   */
  function sha1_kt(t) {
    return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 :
      (t < 60) ? -1894007588 : -899497514;
  }
};

export default SHA1;
