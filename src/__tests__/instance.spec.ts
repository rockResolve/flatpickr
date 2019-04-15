import { defaults, Options } from './../types/options';
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


function beforeEachTest() {
  FlatPickrFn.setDefaults(defaults);
}


describe("static Flatpickr", () => {
  beforeEach(beforeEachTest);


  describe("date formatting", () => {
    const DEFAULT_FORMAT_1 = "d.m.y H:i:S";
    //  DEFAULT_FORMAT_2 = "D j F, 'y";

      it(`should format the date with the pattern "${DEFAULT_FORMAT_1}"`, () => {
        const inputDate = new Date("2019-04-15T16:16:22.585");
        const RESULT = "15.04.19 16:16:22";

        const dateFormatted = FlatPickrFn.formatDate(new Date(inputDate), DEFAULT_FORMAT_1);
        expect(dateFormatted).toEqual(RESULT);
      });
  });

  describe("get global config", () => {
    it("should get defaults", () => {
      const fpGlobalConfig = FlatPickrFn.getGlobalConfig();

      expect(fpGlobalConfig).toEqual(defaults);
    });
  });

  describe("set global config", () => {
    it("should update only static & future instances", () => {

      expect(FlatPickrFn.getGlobalConfig().dateFormat).toEqual(defaults.dateFormat)

      FlatPickrFn.defaultConfig.animate = false;
      FlatPickrFn.defaultConfig.closeOnSelect = true;
      const fp1 = createInstance();
      expect(fp1.config.dateFormat).toEqual(defaults.dateFormat);

      const newDateFormat = "d M y H:i:S";
      FlatPickrFn.setDefaults({ dateFormat: newDateFormat });

      const fp2 = createInstance();

      expect(fp1.config.dateFormat).toEqual(defaults.dateFormat);
      expect(FlatPickrFn.getGlobalConfig().dateFormat).toEqual(newDateFormat)
      expect(fp2.config.dateFormat).toEqual(newDateFormat);

    });

    it("should update dateFormat to affect formatDate & parseDate", () => {
      const inputDate = new Date("2019-04-15T16:16:22");
      const newDateFormat = "d M y H:i:S";

      const dateFormatted = FlatPickrFn.formatDate(new Date(inputDate), newDateFormat);
      expect(dateFormatted).toEqual("15 Apr 19 16:16:22");

      FlatPickrFn.setDefaults({ dateFormat: newDateFormat});

      expect(FlatPickrFn.getGlobalConfig().dateFormat).toEqual(newDateFormat);
    });

    it("should update token functions to affect formatDate & parseDate", () => {
      const inputDate = new Date("2019-04-15T16:16:22");
      const dateFormat1 = "d m y H:i:S";

      let dateFormatted = FlatPickrFn.formatDate(new Date(inputDate), dateFormat1);
      expect(dateFormatted).toEqual("15 04 19 16:16:22");

      let dateParsed = FlatPickrFn.parseDate(dateFormatted, dateFormat1);
      expect(dateParsed).toEqual(inputDate);

      //Do not alter config directly
      // So don't do this:
      //fpGlobalConfig.formatFns["m"] = (date) =>
      // use FlatPickr.setDefaults instead.

      const fpGlobalConfig = FlatPickrFn.getGlobalConfig();

      //obscure example. See configs/millisecondFormatConfig for more realistic usage.
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
  });
});
