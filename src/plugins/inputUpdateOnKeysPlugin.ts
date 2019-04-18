import { Plugin } from "../types/options";
import { Instance } from "types/instance";

function getInputFormat(inputElement: EventTarget | null, flatPickr: Instance) {
  return inputElement === flatPickr.altInput
    ? flatPickr.config.altFormat
    : flatPickr.config.dateFormat;
}

function onInputElementValueChanged(flatPickr: Instance) {
    const inputFormat = getInputFormat(flatPickr._input, flatPickr);
    const newValueDate = flatPickr.parseDate(flatPickr._input.value, inputFormat);

    const oldPickrDate = flatPickr.latestSelectedDateObj;
    //oldPickrDate can be undefined after binding to nullable

    //Only update if different
    if ((oldPickrDate ? oldPickrDate.getTime() : undefined)
      !== (newValueDate ? newValueDate.getTime(): undefined)) {

      //Update calendar, value, but not input Element
      flatPickr.setDate(newValueDate || "", true, inputFormat, true);
    }
    return;
}

function inputUpdateOnKeysPlugin(): Plugin {
  return function(fp) {
    return {
      onParseConfig() {
        fp.config.allowInput = true;
      },
      onReady() {

        // When focus lost update flatpickr date
        fp._input.addEventListener('blur', (event: Event) =>
          //Invalid dates will set flatPickr widget & value to undefined
          fp.setDate(fp._input.value, true, getInputFormat(event.target, fp)));

        // When input value changes update flatpickr date
        // Relies on flatpickr parseDate handling of partial date strings
        fp._input.addEventListener("input",
            () => onInputElementValueChanged(fp));

        fp.loadedPlugins.push("inputUpdateOnKeysPlugin");
      }
    }
  }
}

export default inputUpdateOnKeysPlugin;