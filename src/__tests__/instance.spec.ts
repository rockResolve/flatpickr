import { defaults, Options } from "./../types/options";
import FlatPickrFn from "../index";

FlatPickrFn.defaultConfig.animate = false;
FlatPickrFn.defaultConfig.closeOnSelect = true;

jest.useFakeTimers();

let elem: undefined | HTMLInputElement;
const UA = navigator.userAgent;
let mockAgent: string | undefined;

(navigator as any).__defineGetter__("userAgent", function() {
  return mockAgent || UA;
});

function createInstance(config?: Options, el?: HTMLElement) {
  return FlatPickrFn(
    el || elem || document.createElement("input"),
    config || {}
  );
}


describe("static Flatpickr", () => {
  beforeEach(() => {
    FlatPickrFn.setDefaults(defaults);
  });

  describe("date formatting", () => {
    const DEFAULT_FORMAT_1 = "d.m.y H:i:S";

    it(`should format the date with the pattern "${DEFAULT_FORMAT_1}"`, () => {
      const inputDate = new Date("2019-04-15T16:16:22.585");

      const dateFormatted = FlatPickrFn.formatDate(
        new Date(inputDate),
        DEFAULT_FORMAT_1
      );
      expect(dateFormatted).toEqual("15.04.19 16:16:22");
    });
  });

  describe("get static config", () => {
    it("should get defaults", () => {
      const fpGlobalConfig = FlatPickrFn.getStaticConfig();

      expect(fpGlobalConfig).toEqual(defaults);
    });
  });

  describe("set static config", () => {
    it("should update only static & future instances", () => {
      expect(FlatPickrFn.getStaticConfig().dateFormat).toEqual(
        defaults.dateFormat
      );

      FlatPickrFn.defaultConfig.animate = false;
      FlatPickrFn.defaultConfig.closeOnSelect = true;
      const fp1 = createInstance();
      expect(fp1.config.dateFormat).toEqual(defaults.dateFormat);

      const newDateFormat = "d M y H:i:S";
      FlatPickrFn.setDefaults({ dateFormat: newDateFormat });

      const fp2 = createInstance();

      expect(fp1.config.dateFormat).toEqual(defaults.dateFormat); //old instance unchanged
      expect(FlatPickrFn.getStaticConfig().dateFormat)
        .toEqual(newDateFormat);                                  //static
      expect(fp2.config.dateFormat).toEqual(newDateFormat);       //new instance
    });

    it("should update dateFormat to affect formatDate & parseDate", () => {
      const inputDate = new Date("2019-04-15T16:16:22");
      const newDateFormat = "d M y H:i:S";

      const dateFormatted = FlatPickrFn.formatDate(
        new Date(inputDate),
        newDateFormat
      );
      expect(dateFormatted).toEqual("15 Apr 19 16:16:22");

      FlatPickrFn.setDefaults({ dateFormat: newDateFormat });

      expect(FlatPickrFn.getStaticConfig().dateFormat).toEqual(newDateFormat);
    });

    it("should update token functions to affect formatDate & parseDate", () => {
      const inputDate = new Date("2019-04-15T16:16:22");
      const dateFormat1 = "d m y H:i:S";

      let dateFormatted = FlatPickrFn.formatDate(
        new Date(inputDate),
        dateFormat1
      );
      expect(dateFormatted).toEqual("15 04 19 16:16:22");

      let dateParsed = FlatPickrFn.parseDate(dateFormatted, dateFormat1);
      expect(dateParsed).toEqual(inputDate);

      //Do not alter config directly
      // So don't do this:
      //fpGlobalConfig.formatFns["m"] = (date) =>
      // use FlatPickr.setDefaults instead.

      const fpGlobalConfig = FlatPickrFn.getStaticConfig();

      //obscure example. See plugins/millisecond/millisecondFormatConfig for more realistic usage.
      FlatPickrFn.setDefaults({
        formatFns: {
          ...fpGlobalConfig.formatFns,
          o: (date: Date) => "Month" + date.getMonth(),
        },
        parseTokenRegexs: {
          ...fpGlobalConfig.parseTokenRegexs,
          o: "(\\w+)",
        },
        parseTokenFns: {
          ...fpGlobalConfig.parseTokenFns,
          o: (dateObj: Date, month: string) => {
            dateObj.setMonth(parseFloat(month.substring(5)));
          },
        }
      });

      const dateFormat2 = dateFormat1.replace("m", "o");
      dateFormatted = FlatPickrFn.formatDate(new Date(inputDate), dateFormat2);
      expect(dateFormatted).toEqual("15 Month3 19 16:16:22");

      dateParsed = FlatPickrFn.parseDate(dateFormatted, dateFormat2);
      expect(dateParsed).toEqual(inputDate);
    });

    it("should parse token K using supplied locale", () => {
      // static parseDate() uses defaultParseTokenRegex K.
      // Previously defaultParseTokenRegex K was initially set to "". Any time
      // index.setupLocale() was called (e.g. create a flatpickr instance),
      // the token was updated with the instance's locale rulls

      // Symptoms:
      //  1. until an instance was created, static parseDate didnt parse any K tokens
      //      Only discovered if no flatpickr instance has been created ...
      //      Have to disable all other tests, including createInstance() tests above.
      //  2. static parseDate always used the last instance locale to parse token K

      const dateFormat1 = "d m y H:i:S K";

      let dateParsed = FlatPickrFn.parseDate("15 04 19 04:16:22 PM", dateFormat1);
      expect(dateParsed).toEqual(new Date("2019-04-15T16:16:22"));

      // locale cs uses amPM: ["dop.", "odp."],
      createInstance({locale: { amPM: ["dop.", "odp."] } as any });

      //test static with default locale
      dateParsed = FlatPickrFn.parseDate("15 04 19 04:16:22 PM", dateFormat1);
      expect(dateParsed).toEqual(new Date("2019-04-15T16:16:22"));
    });

    it("should append instance hooks to any static hooks", () => {
      expect(FlatPickrFn.getStaticConfig().onReady).toEqual([]);

      FlatPickrFn.defaultConfig.animate = false;
      FlatPickrFn.defaultConfig.closeOnSelect = true;
      const fp1 = createInstance();
      expect(fp1.config.onReady).toEqual(defaults.onReady);

      let isOnReadyHookFired = false;
      const newOnReadyHook = () => {
        isOnReadyHookFired = true;
      };
      FlatPickrFn.setDefaults({ onReady: newOnReadyHook });
      expect(isOnReadyHookFired).toBe(false);

      let isSecondOnReadyHookFired = false;
      const secondNewOnReadyHook = () => {
        isSecondOnReadyHookFired = true;
      };

      const fp2 = createInstance({ onReady: secondNewOnReadyHook });
      expect(isOnReadyHookFired).toBe(true);
      expect(isSecondOnReadyHookFired).toBe(true);

      expect(fp1.config.onReady).toEqual(defaults.onReady); //old instance unchanged
      expect(FlatPickrFn.getStaticConfig().onReady)
        .toEqual([newOnReadyHook]);                         //static
      //expect(fp2.config.onReady)                            new instance
      //  .toEqual([newOnReadyHook, secondNewOnReadyHook]);   binds functions
      expect(fp2.config.onReady.length).toEqual(2);         //new instance
    });
  });
});
