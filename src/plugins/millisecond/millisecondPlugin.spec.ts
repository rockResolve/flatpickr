import FlatPickr from "../../index";
import millisecondPlugin from "./millisecondPlugin";
import { defaults, Options } from "../../types/options";
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
  return (fp = FlatPickr(
    el || elem || document.createElement("input"),
    config || {}
  ));
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

describe("millisecondPlugin", () => {
  beforeEach(() => {
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

  it("should allowInput milliseconds to set element", () => {
    //Tests index setDate() + setHoursFromDate() + setHours()
    createInstance({
      defaultDate: "2016-12-27T16:16:22.585Z",
      allowInput: true,
      enableTime: true,
      enableSeconds: true,
      dateFormat: "d M Y H:i:S.v",
      plugins: [millisecondPlugin()],
    });

    fp.input.value = "25 Apr 2019 22:13:44.123";
    simulate(
      "keydown",
      fp.input,
      {
        keyCode: 13, // "Enter"
      },
      KeyboardEvent
    );

    expect(fp.latestSelectedDateObj).toEqual(
      new Date("2019-04-25T22:13:44.123")
    );
    expect(fp.secondElement!.value).toBe("44");
    expect(fp.millisecondElement!.value).toBe("123");
  });

  it("should push milliseconds element value to input", () => {
    //Tests index timewrapper(), setHoursFromInputs() + setHours()

    createInstance({
      defaultDate: "2016-12-27T16:16:22.585Z",
      allowInput: true,
      enableTime: true,
      enableSeconds: true,
      dateFormat: "d M Y H:i:S.v",
      plugins: [millisecondPlugin()],
    });

    fp.input.value = "25 Apr 2019 22:13:44.123";
    simulate(
      "keydown",
      fp.input,
      {
        keyCode: 13, // "Enter"
      },
      KeyboardEvent
    );

    expect(fp.latestSelectedDateObj).toEqual(
      new Date("2019-04-25T22:13:44.123")
    );
    expect(fp.millisecondElement!.value).toBe("123");

    fp.millisecondElement!.value = "";
    simulate("input", fp.millisecondElement!);
    simulate("blur", fp.millisecondElement!);
    expect(fp.millisecondElement!.value).toEqual("000");
  });

  it("should correctly be part of tab order", () => {
    //Test index onKeyDown() tab
    createInstance({
      defaultDate: "2016-12-27T16:16:22.585Z",
      allowInput: true,
      enableTime: true,
      enableSeconds: true,
      dateFormat: "d M Y H:i:S.v",
      plugins: [millisecondPlugin()],
    });

    fp.open();
    fp.secondElement!.focus();

    simulate(
      "keydown",
      document.activeElement!,
      {
        keyCode: 9, // Tab
      },
      KeyboardEvent
    );
    expect(document.activeElement).toStrictEqual(fp.millisecondElement!);

    simulate(
      "keydown",
      document.activeElement!,
      {
        keyCode: 9, // Tab
      },
      KeyboardEvent
    );
    expect(document.activeElement).toStrictEqual(fp.amPM!);
  });
});
