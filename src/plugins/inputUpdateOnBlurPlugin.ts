import { Plugin } from "../types/options";

function inputUpdateOnBlurPlugin(): Plugin {
  return function(fp) {
    return {
      onParseConfig() {
        fp.config.allowInput = true;
      },
      onReady() {
        fp._input.addEventListener('blur', (event: Event) => {
          fp.setDate(
            fp._input.value,
            true,
            event.target === fp.altInput
            ? fp.config.altFormat
            : fp.config.dateFormat
          );
        });

        fp.loadedPlugins.push("inputUpdateOnBlurPlugin");
      }
    }
  }
}

export default inputUpdateOnBlurPlugin;
