import { Instance } from "../../types/instance";
import { createNumberInput, createElement } from "../../utils/dom";
import { pad } from "../../utils";

import { Plugin } from "../../types/options";
import millisecondFormatConfig from "./millisecondFormatConfig";

function millisecondPlugin(): Plugin {
  return function(fp) {
    return {
      onParseConfig() {
        if (!fp.config.formatFns.v) {
          // millisecondFormatStaticConfig not run, so add millisecond
          // format/parse config to this flatpickr instance
          fp.config.formatFns = {
            ...fp.config.formatFns,
            ...millisecondFormatConfig.millisecondFormatFn,
          };
          fp.config.parseTokenRegexs = {
            ...fp.config.parseTokenRegexs,
            ...millisecondFormatConfig.millisecondParseTokenRegex,
          };
          fp.config.parseTokenFns = {
            ...fp.config.parseTokenFns,
            ...millisecondFormatConfig.millisecondParseTokenFn,
          };
        }
      },

      onReady(
        _selectedDates: Date[],
        _currentDateString: string,
        flatPickr: Instance
      ) {
        if (!flatPickr.config.enableTime || !flatPickr.config.enableSeconds) {
          return;
        }

        //buildMilliseconds (based on index.ts buildTime() seconds)

        // unused flatPickr.timeContainer!.classList.add("hasMilliseconds");

        const millisecondInput = createNumberInput("flatpickr-millisecond");

        const millisecondElement = millisecondInput.getElementsByTagName(
          "input"
        )[0] as HTMLInputElement;

        millisecondElement.value = pad(
          flatPickr.latestSelectedDateObj
            ? flatPickr.latestSelectedDateObj.getMilliseconds()
            : 0, //flatPickr.config.defaultMilliseconds,
          3
        );

        millisecondElement.setAttribute(
          "step",
          flatPickr.secondElement!.getAttribute("step") as string
        );
        millisecondElement.setAttribute("min", "0");
        millisecondElement.setAttribute("max", "999");

        flatPickr.timeContainer!.insertBefore(
          createElement("span", "flatpickr-time-separator", "."),
          flatPickr.amPM || null
        );
        flatPickr.timeContainer!.insertBefore(
          millisecondInput,
          flatPickr.amPM || null
        );

        flatPickr._bind(millisecondElement, "focus", () =>
          millisecondElement.select()
        );
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

export default millisecondPlugin;
