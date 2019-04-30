(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.inputUpdateOnBlurPlugin = factory());
}(this, function () { 'use strict';

  function inputUpdateOnBlurPlugin() {
      return function (fp) {
          return {
              onParseConfig: function () {
                  fp.config.allowInput = true;
              },
              onReady: function () {
                  fp._input.addEventListener('blur', function (event) {
                      fp.setDate(fp._input.value, true, event.target === fp.altInput
                          ? fp.config.altFormat
                          : fp.config.dateFormat);
                  });
                  fp.loadedPlugins.push("inputUpdateOnBlurPlugin");
              }
          };
      };
  }

  return inputUpdateOnBlurPlugin;

}));
