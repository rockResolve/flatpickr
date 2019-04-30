(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.inputUpdateOnKeysPlugin = factory());
}(this, function () { 'use strict';

  function getInputFormat(inputElement, flatPickr) {
      return inputElement === flatPickr.altInput
          ? flatPickr.config.altFormat
          : flatPickr.config.dateFormat;
  }
  function onInputElementValueChanged(flatPickr) {
      var inputFormat = getInputFormat(flatPickr._input, flatPickr);
      var newValueDate = flatPickr.parseDate(flatPickr._input.value, inputFormat);
      var oldPickrDate = flatPickr.latestSelectedDateObj;
      //oldPickrDate can be undefined after binding to nullable
      //Only update if different
      if ((oldPickrDate ? oldPickrDate.getTime() : undefined)
          !== (newValueDate ? newValueDate.getTime() : undefined)) {
          //Update calendar, value, but not input Element
          flatPickr.setDate(newValueDate || "", true, inputFormat, true);
      }
      return;
  }
  function inputUpdateOnKeysPlugin() {
      return function (fp) {
          return {
              onParseConfig: function () {
                  fp.config.allowInput = true;
              },
              onReady: function () {
                  // When focus lost update flatpickr date
                  fp._input.addEventListener('blur', function (event) {
                      //Invalid dates will set flatPickr widget & value to undefined
                      return fp.setDate(fp._input.value, true, getInputFormat(event.target, fp));
                  });
                  // When input value changes update flatpickr date
                  // Relies on flatpickr parseDate handling of partial date strings
                  fp._input.addEventListener("input", function () { return onInputElementValueChanged(fp); });
                  fp.loadedPlugins.push("inputUpdateOnKeysPlugin");
              }
          };
      };
  }

  return inputUpdateOnKeysPlugin;

}));
