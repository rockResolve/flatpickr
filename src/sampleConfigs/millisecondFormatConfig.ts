import { FlatpickrFn } from "../types/instance";

function millisecondFormatConfig(FlatPickr: FlatpickrFn): void {

  const fpStaticConfig = FlatPickr.getStaticConfig();

  // WARNING: As configs are only ever shallow copied, changes to existing config
  // child objects would affect:
  //          the static config,
  //          the config in new FlatPickr instances,
  //          AND alarmingly existing FlatPickr instances.
  // So don't do this:
  //   fpStaticConfig.formatFns!["v"] = (date: Date) => date.getMilliseconds();
  // use FlatPickr.setDefaults instead.

  FlatPickr.setDefaults({
    formatFns: {
      ...fpStaticConfig.formatFns,
      // milliseconds 000-999
      v: (date: Date) => ("00" + date.getMilliseconds()).slice(-3),
    },
    parseTokenRegexs: {
      ...fpStaticConfig.parseTokenRegexs,
      v: "(\\d\\d\\d|\\d\\d|\\d)",
    },
    parseTokenFns: {
      ...fpStaticConfig.parseTokenFns,
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
