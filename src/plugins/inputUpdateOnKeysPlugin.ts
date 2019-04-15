import { Plugin } from "../types/options";
import { Instance } from "types/instance";

function onInputElementValueChanged(event: Event, flatPickr: Instance) {
    const inputFormat = event.target === flatPickr.altInput
      ? flatPickr.config.altFormat
      : flatPickr.config.dateFormat;
    const newValueStr = (event.target as HTMLInputElement).value;
    const newValueDate = flatPickr.parseDate(newValueStr, inputFormat);

    if (!newValueDate) {    // Ignore invalid dates
      return;
    }

    const pickrDate = flatPickr.latestSelectedDateObj;

    if (!pickrDate      //can arise from binding to nullable
      || pickrDate.getTime() !== newValueDate.getTime()) {

      flatPickr!.setDate(newValueDate, undefined,
        inputFormat,
        true);
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
        fp._input.addEventListener('blur', (event: Event) => {
          fp.setDate(
            fp._input.value,
            true,
            event.target === fp.altInput
            ? fp.config.altFormat
            : fp.config.dateFormat
          );
        });

        // When input value changes update flatpickr date
        // Relies on flatpickr parseDate handling of partial date strings
        fp._input.addEventListener("input",
            (event: Event) => onInputElementValueChanged(event, fp));

        fp.loadedPlugins.push("inputUpdateOnKeysPlugin");
      }
    }
  }
}

export default inputUpdateOnKeysPlugin;