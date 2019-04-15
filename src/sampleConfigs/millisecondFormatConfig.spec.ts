import FlatPickr from "../index";
import millisecondFormatConfig from "./millisecondFormatConfig";


describe("millisecondFormat", () => {
  it("should correctly format milliseconds", () => {

    const inputDate = new Date("2019-04-15T16:16:22.347");
    let dateFormat = "d m y H:i:S.v";

    millisecondFormatConfig(FlatPickr);

    const dateFormatted = FlatPickr.formatDate(inputDate, dateFormat);
    expect(dateFormatted).toEqual("15 04 19 16:16:22.347");

    const dateParsed = FlatPickr.parseDate(dateFormatted, dateFormat);
    expect(dateParsed).toEqual(inputDate);
  });
});
