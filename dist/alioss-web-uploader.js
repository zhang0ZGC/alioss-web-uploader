(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.AliOSSWebUploader = factory());
}(this, (function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    /**
     * remove ^\/+
     * @param name
     */
    function objectName(name) {
        return name.replace(/^\/+/, '');
    }
    function escapeName(name) {
        return encodeURIComponent(name).replace(/%2F/g, '/');
    }
    function isHttpsProtocol() {
        return location && location.protocol === 'https:';
    }

    // unescape(encodeURIComponent(str))
    function utf8Encode(str) {
        var x, y, output = '', i = -1, l;
        if (str && str.length) {
            l = str.length;
            while ((i += 1) < l) {
                /* Decode utf-16 surrogate pairs */
                x = str.charCodeAt(i);
                y = i + 1 < l ? str.charCodeAt(i + 1) : 0;
                if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
                    x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
                    i += 1;
                }
                /* Encode output as utf-8 */
                if (x <= 0x7F) {
                    output += String.fromCharCode(x);
                }
                else if (x <= 0x7FF) {
                    output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F), 0x80 | (x & 0x3F));
                }
                else if (x <= 0xFFFF) {
                    output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F), 0x80 | ((x >>> 6) & 0x3F), 0x80 | (x & 0x3F));
                }
                else if (x <= 0x1FFFFF) {
                    output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07), 0x80 | ((x >>> 12) & 0x3F), 0x80 | ((x >>> 6) & 0x3F), 0x80 | (x & 0x3F));
                }
            }
        }
        return output;
    }
    /**
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF), msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }
    /**
     * Bitwise rotate a 32-bit number to the left.
     */
    function bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }
    /**
     * Convert a raw string to a hex string
     */
    function rstr2hex(input, hexCase) {
        var hex_tab = hexCase ? '0123456789ABCDEF' : '0123456789abcdef', output = '', x, i = 0, l = input.length;
        for (; i < l; i += 1) {
            x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0F) + hex_tab.charAt(x & 0x0F);
        }
        return output;
    }
    /**
     * Convert an array of big-endian words to a string
     */
    function binb2rstr(input) {
        var i, l = input.length * 32, output = '';
        for (i = 0; i < l; i += 8) {
            output += String.fromCharCode((input[i >> 5] >>> (24 - i % 32)) & 0xFF);
        }
        return output;
    }
    /**
     * Convert a raw string to an array of big-endian words
     * Characters >255 have their high-byte silently ignored.
     */
    function rstr2binb(input) {
        var i, l = input.length * 8, output = Array(input.length >> 2), lo = output.length;
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
    function rstr2any(input, encoding) {
        var divisor = encoding.length, remainders = Array(), i, q, x, ld, quotient, dividend, output, full_length;
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
    function rstr2b64(input, b64pad) {
        if (b64pad === void 0) { b64pad = '='; }
        var tab = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var output = '', len = input.length, i, j, triplet;
        for (i = 0; i < len; i += 3) {
            triplet = (input.charCodeAt(i) << 16) | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
            for (j = 0; j < 4; j += 1) {
                if (i * 8 + j * 6 > input.length * 8) {
                    output += b64pad;
                }
                else {
                    output += tab.charAt((triplet >>> 6 * (3 - j)) & 0x3F);
                }
            }
        }
        return output;
    }

    /**
     * This file is copied from https://github.com/react-component/upload/blob/master/src/request.js
     * Thanks the authors.
     */
    function getError(url, option, xhr) {
        var codePart = xhr.response.match(/<Code>(.+)<\/Code>/);
        // const messagePart = xhr.response.match(/<Message>(.+)<\/<Message>>/);
        var method = option.method || 'GET';
        var msg = "[" + xhr.status + "] " + method + " " + url + "': " + (codePart && codePart[1] || '');
        var err = new Error(msg);
        err.status = xhr.status;
        err.method = method;
        err.code = codePart && codePart[1] || '';
        err.url = url;
        return err;
    }
    function getBody(xhr) {
        var text = xhr.responseText || xhr.response;
        if (!text) {
            return text;
        }
        try {
            return JSON.parse(text);
        }
        catch (e) {
            return text;
        }
    }
    function request(url, options) {
        var xhr = new XMLHttpRequest();
        xhr.timeout = options.timeout || 60000;
        if (options.onProgress && xhr.upload) {
            xhr.upload.onprogress = function progress(e) {
                if (e.total > 0) {
                    e.percent = e.loaded / e.total * 100;
                }
                options.onProgress(e);
            };
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
            var result = {
                status: xhr.status,
                statusText: xhr.statusText,
                xhr: xhr,
                data: getBody(xhr),
            };
            options.onSuccess(result, xhr);
        };
        xhr.ontimeout = function timeout(ev) {
            var err = new Error("Request timeout, limit " + xhr.timeout + " ms.");
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
        var headers = options.headers || {};
        if (headers['X-Requested-With'] !== null) {
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
        for (var h in headers) {
            if (headers.hasOwnProperty(h) && headers[h] !== null) {
                xhr.setRequestHeader(h, headers[h]);
            }
        }
        // xhr.send(formData);
        xhr.send(options.data || null);
        return {
            abort: function () {
                xhr.abort();
            },
        };
    }

    /**
     * Copy from https://github.com/h2non/jshashes/blob/master/hashes.js
     */
    var SHA1 = function SHA1(options) {
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
            var i, j, t, olda, oldb, oldc, oldd, olde, w = Array(80), a = 1732584193, b = -271733879, c = -1732584194, d = 271733878, e = -1009589776;
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
                    }
                    else {
                        w[j] = bit_rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                    }
                    t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));
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
        function rstr(s, utf8) {
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

    function computeSignature(accessKeySecret, canonicalString) {
        return new SHA1().b64_hmac(accessKeySecret, canonicalString);
    }

    function getOssParams(params, extendKeys) {
        if (extendKeys === void 0) { extendKeys = []; }
        var out = {};
        Object.keys(params).forEach(function (key) {
            var lowerKey = key.toLowerCase();
            if (lowerKey.substr(0, 6) === 'x-oss-' || extendKeys.indexOf(key) > -1) {
                out[lowerKey] = params[key];
            }
        });
        return out;
    }
    var Client = /** @class */ (function () {
        function Client(options) {
            if (!(this instanceof Client)) {
                return new Client(options);
            }
            if (!options.bucket) {
                throw new Error('bucket is required.');
            }
            var opts = __assign(__assign({ endpoint: null, region: 'oss-cn-hangzhou', timeout: 300000, internal: false, 
                // cname: false,
                secure: undefined }, options), { host: '' });
            if (opts.endpoint) ;
            else if (opts.region) {
                opts.endpoint = opts.bucket;
                if (opts.internal)
                    opts.endpoint += '-internal';
                opts.endpoint += "." + opts.region + ".aliyuncs.com";
            }
            else {
                throw new Error('require options.endpoint or options.region');
            }
            // 一般情况下不需要设置 `secure` 参数，唯一需要用到的场景可能就是在 http 页面中使用 https 连接了
            opts.host += "http" + (opts.secure === true || isHttpsProtocol() ? 's' : '') + "://" + opts.endpoint;
            this.opts = opts;
        }
        /*
        public putObject(name, file: File|BlobPart, options){
      
        }
        */
        /**
         * post object as form/multi-part
         * @param name
         * @param file
         * @param options
         */
        Client.prototype.postObject = function (name, file, options) {
            if (!options.policy)
                options.policy = {};
            var policyBase64;
            var data = new FormData();
            data.append('key', objectName(name));
            if (this.opts.accessKeyId && this.opts.accessKeySecret) {
                if (typeof options.policy === 'string') {
                    policyBase64 = options.policy;
                }
                else {
                    var policy = __assign({ "expiration": new Date(+new Date() + 24 * 3600 * 7).toISOString(), "conditions": [
                            { "bucket": this.opts.bucket },
                            { "key": objectName(name) },
                            ["content-length-range", 0, 1024 * 1024 * 1024],
                        ] }, options.policy);
                    policyBase64 = rstr2b64(utf8Encode(JSON.stringify(policy)));
                }
                var signature = options.signature || computeSignature(this.opts.accessKeySecret, policyBase64);
                data.append('OSSAccessKeyId', this.opts.accessKeyId);
                data.append('policy', policyBase64);
                data.append('Signature', signature);
                if (this.opts.stsToken) {
                    data.append('x-oss-security-token', this.opts.stsToken);
                }
            }
            var ossParam = getOssParams(options, ['success_action_status', 'success_action_redirect']);
            Object.keys(ossParam).forEach(function (k) { return data.append(k, ossParam[k]); });
            data.append('file', file);
            var reqOptions = {
                method: 'POST',
                data: data,
                timeout: options.timeout || this.opts.timeout,
                onSuccess: options.onSuccess || function () { },
                onError: options.onError || function (e) {
                    console.error(e);
                },
            };
            if (options.onProgress)
                reqOptions.onProgress = options.onProgress;
            return request(this.opts.host, reqOptions);
        };
        /**
         * Get the Object url.
         * If provide baseUrl, will use baseUrl instead the default bucket and endpoint .
         * @param name
         * @param baseUrl
         */
        Client.prototype.generateObjectUrl = function (name, baseUrl) {
            if (!baseUrl) {
                baseUrl = this.opts.host + '/';
            }
            else if (baseUrl[baseUrl.length - 1] !== '/') {
                baseUrl += '/';
            }
            return baseUrl + escapeName(objectName(name));
        };
        return Client;
    }());

    return Client;

})));
//# sourceMappingURL=alioss-web-uploader.js.map
