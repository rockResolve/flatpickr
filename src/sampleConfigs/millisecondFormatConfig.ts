import { FlatpickrFn } from "../types/instance";

function millisecondFormatConfig(FlatPickr: FlatpickrFn): void {

  const fpGlobalConfig = FlatPickr.getGlobalConfig();

  // WARNING: As configs are only ever shallow copied, changes to existing config
  // child objects would affect:
  //          the global config,
  //          the config in new FlatPickr instances,
  //          AND alarmingly existing FlatPickr instances.
  // So don't do this:
  //   fpGlobalConfig.formatFns!["v"] = (date: Date) => date.getMilliseconds();
  // use FlatPickr.setDefaults instead.

  FlatPickr.setDefaults({
    formatFns: {
      ...fpGlobalConfig.formatFns,
      // milliseconds 000-999
      v: (date: Date) => ("00" + date.getMilliseconds()).slice(-3),
    },
    parseTokenRegexs: {
      ...fpGlobalConfig.parseTokenRegexs,
      v: "(\\d\\d\\d|\\d\\d|\\d)",
    },
    parseTokenFns: {
      ...fpGlobalConfig.parseTokenFns,
      v: (
        dateObj: Date,
        milliseconds: string
      ) => {
        dateObj.setMilliseconds(parseFloat(milliseconds));
      }
    }
  });
}

export default millisecondFormatConfig;
