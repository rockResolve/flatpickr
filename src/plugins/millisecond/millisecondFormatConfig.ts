import { FlatpickrFn } from "../../types/instance";
import { pad } from "../../utils";

const millisecondFormatConfig = {

  millisecondFormatFn: {
    // milliseconds 000-999
    v: (date: Date) => pad(date.getMilliseconds(), 3),
  },

  millisecondParseTokenRegex: {
    v: "(\\d\\d\\d|\\d\\d|\\d)",
  },

  millisecondParseTokenFn: {
    v: (dateObj: Date, milliseconds: string) => {
      dateObj.setMilliseconds(parseFloat(milliseconds));
    },
  },

  // /** Used to config static format/parse functions. Does not change widget */
  millisecondFormatStaticConfig: (FlatPickr: FlatpickrFn) => {
    const fpGlobalConfig = FlatPickr.getStaticConfig();

    // WARNING: As configs are only ever shallow copied, changes to existing config
    // child objects would affect:
    //          the static config,
    //          the config in new FlatPickr instances,
    //          AND alarmingly existing FlatPickr instances.
    // So don't do this:
    //   fpGlobalConfig.formatFns["v"] = (date: Date) => date.getMilliseconds();
    // use FlatPickr.setDefaults instead.

    FlatPickr.setDefaults({
      formatFns: {
        ...fpGlobalConfig.formatFns,
        ...millisecondFormatConfig.millisecondFormatFn,
      },
      parseTokenRegexs: {
        ...fpGlobalConfig.parseTokenRegexs,
        ...millisecondFormatConfig.millisecondParseTokenRegex,
      },
      parseTokenFns: {
        ...fpGlobalConfig.parseTokenFns,
        ...millisecondFormatConfig.millisecondParseTokenFn,
      },
    });
  }
}

export default millisecondFormatConfig;