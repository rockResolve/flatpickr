(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.millisecondFormatConfig = factory());
}(this, function () { 'use strict';

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

    var pad = function (number, digits) {
        if (digits === void 0) { digits = 2; }
        return (Array(digits).join("0") //IE compatible repeat
            + number).slice(digits * -1);
    };

    var millisecondFormatConfig = {
        millisecondFormatFn: {
            // milliseconds 000-999
            v: function (date) { return pad(date.getMilliseconds(), 3); }
        },
        millisecondParseTokenRegex: {
            v: "(\\d\\d\\d|\\d\\d|\\d)"
        },
        millisecondParseTokenFn: {
            v: function (dateObj, milliseconds) {
                dateObj.setMilliseconds(parseFloat(milliseconds));
            }
        },
        // /** Used to config static format/parse functions. Does not change widget */
        millisecondFormatStaticConfig: function (FlatPickr) {
            var fpGlobalConfig = FlatPickr.getStaticConfig();
            // WARNING: As configs are only ever shallow copied, changes to existing config
            // child objects would affect:
            //          the static config,
            //          the config in new FlatPickr instances,
            //          AND alarmingly existing FlatPickr instances.
            // So don't do this:
            //   fpGlobalConfig.formatFns["v"] = (date: Date) => date.getMilliseconds();
            // use FlatPickr.setDefaults instead.
            FlatPickr.setDefaults({
                formatFns: __assign({}, fpGlobalConfig.formatFns, millisecondFormatConfig.millisecondFormatFn),
                parseTokenRegexs: __assign({}, fpGlobalConfig.parseTokenRegexs, millisecondFormatConfig.millisecondParseTokenRegex),
                parseTokenFns: __assign({}, fpGlobalConfig.parseTokenFns, millisecondFormatConfig.millisecondParseTokenFn)
            });
        }
    };

    return millisecondFormatConfig;

}));
