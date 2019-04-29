import FlatPickr from "../../index";
import millisecondFormatConfig from "./millisecondFormatConfig";
import { defaults, Options } from '../../types/options';
import { Instance } from "../../types/instance";

FlatPickr.defaultConfig.animate = false;
FlatPickr.defaultConfig.closeOnSelect = true;

jest.useFakeTimers();

let elem: undefined | HTMLInputElement;
let fp: Instance;
const UA = navigator.userAgent;
let mockAgent: string | undefined;

(navigator as any).__defineGetter__("userAgent", function() {
  return mockAgent || UA;
});

function createInstance(config?: Options, el?: HTMLElement) {
  return fp = FlatPickr(
    el || elem || document.createElement("input"),
    config || {}
  );
}


function simulate(
  eventType: string,
  onElement: Node,
  options?: object,
  type?: any
) {
  const eventOptions = Object.assign(options || {}, { bubbles: true });
  const evt = new (type || CustomEvent)(eventType, eventOptions);
  try {
    Object.assign(evt, eventOptions);
  } catch (e) {}

  onElement.dispatchEvent(evt);
}


describe("millisecondFormatConfig", () => {
  beforeEach( () => {
    FlatPickr.setDefaults(defaults);

    mockAgent = undefined;
    jest.runAllTimers();
    (document.activeElement as HTMLElement).blur();

    fp && fp.destroy();

    if (elem === undefined) {
      elem = document.createElement("input");
      document.body.appendChild(elem);
    }
  });

  it("static should correctly format & parse milliseconds", () => {
    const inputDate = new Date("2019-04-15T16:16:22.347");
    let dateFormat = "d m y H:i:S.v";

    millisecondFormatConfig.millisecondFormatStaticConfig(FlatPickr);

    const dateFormatted = FlatPickr.formatDate(inputDate, dateFormat);
    expect(dateFormatted).toEqual("15 04 19 16:16:22.347");

    const dateParsed = FlatPickr.parseDate(dateFormatted, dateFormat);
    expect(dateParsed).toEqual(inputDate);
  });

  it("instance should correctly format & parse milliseconds", () => {
    const inputDate = new Date("2019-04-15T16:16:22.347");
    let dateFormat = "d m y H:i:S.v";

    millisecondFormatConfig.millisecondFormatStaticConfig(FlatPickr);
    createInstance({
      defaultDate: "2016-12-27T16:16:22.585Z",
      enableTime: true,
      dateFormat: dateFormat,
      //plugin
    });

    const dateFormatted = fp.formatDate(inputDate, dateFormat);
    expect(dateFormatted).toEqual("15 04 19 16:16:22.347");

    const dateParsed = fp.parseDate(dateFormatted);
    expect(dateParsed).toEqual(inputDate);
  });

  it("should correctly allowInput milliseconds to set selected", () => {
    millisecondFormatConfig.millisecondFormatStaticConfig(FlatPickr);
    createInstance({
      defaultDate: "2016-12-27T16:16:22.585Z",
      allowInput: true,
      enableTime: true,
      dateFormat: "d M Y H:i:S.v",
      //plugin
    });

    fp.input.value = "24 Apr 2019 20:50:33.696";
    simulate(
      "keydown",
      fp.input,
      {
        keyCode: 13, // "Enter"
      },
      KeyboardEvent
    );

    expect(fp.selectedDates.length).toBe(1);
    expect(fp.selectedDates[0]).toEqual(new Date("2019-04-24T20:50:33.696"));
    expect(fp.latestSelectedDateObj).toEqual(new Date("2019-04-24T20:50:33.696"));
  });

});
