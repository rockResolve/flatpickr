(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.millisecondPlugin = factory());
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

    function createElement(tag, className, content) {
        var e = window.document.createElement(tag);
        className = className || "";
        content = content || "";
        e.className = className;
        if (content !== undefined)
            e.textContent = content;
        return e;
    }
    function createNumberInput(inputClassName, opts) {
        var wrapper = createElement("div", "numInputWrapper"), numInput = createElement("input", "numInput " + inputClassName), arrowUp = createElement("span", "arrowUp"), arrowDown = createElement("span", "arrowDown");
        if (navigator.userAgent.indexOf("MSIE 9.0") === -1) {
            numInput.type = "number";
        }
        else {
            numInput.type = "text";
            numInput.pattern = "\\d*";
        }
        if (opts !== undefined)
            for (var key in opts)
                numInput.setAttribute(key, opts[key]);
        wrapper.appendChild(numInput);
        wrapper.appendChild(arrowUp);
        wrapper.appendChild(arrowDown);
        return wrapper;
    }

    var pad = function (number, digits) {
        if (digits === void 0) { digits = 2; }
        return ("0".repeat(digits - 1) + number).slice(digits * -1);
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

    function millisecondPlugin() {
        return function (fp) {
            return {
                onParseConfig: function () {
                    if (!fp.config.formatFns.v) {
                        // millisecondFormatStaticConfig not run, so add millisecond
                        // format/parse config to this flatpickr instance
                        fp.config.formatFns = __assign({}, fp.config.formatFns, millisecondFormatConfig.millisecondFormatFn);
                        fp.config.parseTokenRegexs = __assign({}, fp.config.parseTokenRegexs, millisecondFormatConfig.millisecondParseTokenRegex);
                        fp.config.parseTokenFns = __assign({}, fp.config.parseTokenFns, millisecondFormatConfig.millisecondParseTokenFn);
                    }
                },
                onReady: function (_selectedDates, _currentDateString, flatPickr) {
                    if (!flatPickr.config.enableTime || !flatPickr.config.enableSeconds) {
                        return;
                    }
                    //buildMilliseconds (based on index.ts buildTime() seconds)
                    // unused flatPickr.timeContainer!.classList.add("hasMilliseconds");
                    var millisecondInput = createNumberInput("flatpickr-millisecond");
                    var millisecondElement = millisecondInput.getElementsByTagName("input")[0];
                    millisecondElement.value = pad(flatPickr.latestSelectedDateObj
                        ? flatPickr.latestSelectedDateObj.getMilliseconds()
                        : 0, //flatPickr.config.defaultMilliseconds,
                    3);
                    millisecondElement.setAttribute("step", flatPickr.secondElement.getAttribute("step"));
                    millisecondElement.setAttribute("min", "0");
                    millisecondElement.setAttribute("max", "999");
                    flatPickr.timeContainer.insertBefore(createElement("span", "flatpickr-time-separator", "."), flatPickr.amPM || null);
                    flatPickr.timeContainer.insertBefore(millisecondInput, flatPickr.amPM || null);
                    flatPickr._bind(millisecondElement, "focus", function () {
                        return millisecondElement.select();
                    });
                    //buildMilliseconds end
                    flatPickr.millisecondElement = millisecondElement;
                    //not sure why index does this. Doesnt focus always select anyway? It does in practice.
                    //flatPickr._bind(flatPickr.millisecondElement, "focus", () => flatPickr.millisecondElement!.select());
                    // Milliseconds are not supported in
                    //  + self.config.defaultMilliseconds does not exist - 000 assumed
                    //  + self.config.maxDate & minDate - 000 assumed
                    flatPickr.loadedPlugins.push("millisecondPlugin");
                }
            };
        };
    }

    return millisecondPlugin;

}));
