import { int, pad } from "../utils";
import { Locale } from "../types/locale";
import { ParsedOptions } from "../types/options";

const do_nothing = (): undefined => undefined;

export const monthToStr = (
  monthNumber: number,
  shorthand: boolean,
  locale: Locale
) => locale.months[shorthand ? "shorthand" : "longhand"][monthNumber];

const monthStrToDate = (
  monthName: string,
  shorthand: boolean,
  locale: Locale,
  dateObj: Date
) => {
  // Handle wrong case of input monthName
  // Note: Some locales have 1 character shorthand months.
  if (monthName.length > 1) {
    monthName =
      monthName[0].toUpperCase() + monthName.substring(1).toLowerCase();
  }

  const monthIndex = locale.months[
    shorthand ? "shorthand" : "longhand"
  ].indexOf(monthName);
  if (monthIndex > -1) {
    dateObj.setMonth(monthIndex);
  }
};

export function getDaysInMonth(monthIndex: number, centuryYear: number, locale: Locale) {
  if (monthIndex === 1 && ((centuryYear % 4 === 0 && centuryYear % 100 !== 0) || centuryYear % 400 === 0))
    return 29;

  return locale.daysInMonth[monthIndex];
}


export type ParseTokenFn = (
  date: Date,
  data: string,
  locale: Locale
) => Date | void | undefined;
export type ParseTokenFns = Record<string, ParseTokenFn>;
export const defaultParseTokenFns: ParseTokenFns = {
  D: do_nothing,
  F: function(dateObj: Date, monthName: string, locale: Locale) {
    monthStrToDate(monthName, false, locale, dateObj);
  },
  G: (dateObj: Date, hour: string) => {
    dateObj.setHours(parseFloat(hour));
  },
  H: (dateObj: Date, hour: string) => {
    dateObj.setHours(parseFloat(hour));
  },
  J: (dateObj: Date, day: string, locale: Locale) => {
    const dayNumber = parseFloat(day);

    // const newDate = new Date(dateObj.getTime());
    // newDate.setDate(dayNumber);
    // if (newDate.getDate() === dayNumber) {
    //   dateObj.setDate(dayNumber);
    // }

    if (dayNumber >= 1
      && dayNumber <= getDaysInMonth(dateObj.getMonth(), dateObj.getFullYear(), locale)) {

        dateObj.setDate(dayNumber);
    }
  },
  K: (dateObj: Date, amPM: string, locale: Locale) => {
    dateObj.setHours(
      (dateObj.getHours() % 12) +
        12 * int(new RegExp(locale.amPM[1], "i").test(amPM))
    );
  },
  M: function(dateObj: Date, shortMonth: string, locale: Locale) {
    monthStrToDate(shortMonth, true, locale, dateObj);
  },
  S: (dateObj: Date, seconds: string) => {
    dateObj.setSeconds(parseFloat(seconds));
  },
  U: (_: Date, unixSeconds: string) => new Date(parseFloat(unixSeconds) * 1000),

  W: function(dateObj: Date, weekNum: string, locale: Locale) {
    const weekNumber = parseInt(weekNum);
    const date = new Date(
      dateObj.getFullYear(),
      0,
      2 + (weekNumber - 1) * 7,
      0,
      0,
      0,
      0
    );
    date.setDate(date.getDate() - date.getDay() + locale.firstDayOfWeek);

    return date;
  },
  Y: (dateObj: Date, year: string) => {
    dateObj.setFullYear(parseFloat(year));
  },
  Z: (_: Date, ISODate: string) => new Date(ISODate),

  d: (dateObj: Date, day: string, locale: Locale) => {
    defaultParseTokenFns.J(dateObj, day, locale);
  },
  h: (dateObj: Date, hour: string) => {
    dateObj.setHours(parseFloat(hour));
  },
  i: (dateObj: Date, minutes: string) => {
    dateObj.setMinutes(parseFloat(minutes));
  },
  j: (dateObj: Date, day: string, locale: Locale) => {
    defaultParseTokenFns.J(dateObj, day, locale);
  },
  l: do_nothing,
  m: (dateObj: Date, month: string) => {
    const monthNumber = parseFloat(month);
    if (monthNumber >= 1 && monthNumber <= 12) {
      dateObj.setMonth(monthNumber - 1);
    }
  },
  n: (dateObj: Date, month: string, locale: Locale) => {
    defaultParseTokenFns.m(dateObj, month, locale);
  },
  s: (dateObj: Date, seconds: string) => {
    dateObj.setSeconds(parseFloat(seconds));
  },
  u: (_: Date, unixMillSeconds: string) =>
    new Date(parseFloat(unixMillSeconds)),
  w: do_nothing,
  y: (dateObj: Date, year: string) => {
    dateObj.setFullYear(2000 + parseFloat(year));
  },
};

export type ParseTokenRegexs = Record<string, string | ((locale: Locale) => string)>;
export const defaultParseTokenRegexs: ParseTokenRegexs = {
  D: "(\\w+)",
  F: "(\\w+)",
  G: "(\\d\\d|\\d)",
  H: "(\\d\\d|\\d)",
  J: "(\\d\\d|\\d)\\w+",
  K: (locale) => `(${locale.amPM[0]}|${locale.amPM[1]}`
                  + `|${locale.amPM[0].toLowerCase()}|${locale.amPM[1].toLowerCase()})`,
  M: "(\\w+)",
  S: "(\\d\\d|\\d)",
  U: "(.+)",
  W: "(\\d\\d|\\d)",
  Y: "(\\d{4})",
  Z: "(.+)",
  d: "(\\d\\d|\\d)",
  h: "(\\d\\d|\\d)",
  i: "(\\d\\d|\\d)",
  j: "(\\d\\d|\\d)",
  l: "(\\w+)",
  m: "(\\d\\d|\\d)",
  n: "(\\d\\d|\\d)",
  s: "(\\d\\d|\\d)",
  u: "(.+)",
  w: "(\\d\\d|\\d)",
  y: "(\\d{2})",
};

export type ParseTokenOrders = Record<string, number>;
export const defaultParseTokenOrders: ParseTokenOrders = {
  y: 1, //Year first to handle leapday dependant on year
  Y: 1,
  F: 2, //Month next to handle day dependant on month
  m: 2,
  n: 2,
  M: 2,
};

export type FormatFns = Record<
  string,
  (date: Date, locale: Locale, options: ParsedOptions) => string | number
>;
export const defaultFormatFns: FormatFns = {
  // get the date in UTC
  Z: (date: Date) => date.toISOString(),

  // weekday name, short, e.g. Thu
  D: function(date: Date, locale: Locale, options: ParsedOptions) {
    return locale.weekdays.shorthand[
      defaultFormatFns.w(date, locale, options) as number
    ];
  },

  // full month name e.g. January
  F: function(date: Date, locale: Locale, options: ParsedOptions) {
    return monthToStr(
      (defaultFormatFns.n(date, locale, options) as number) - 1,
      false,
      locale
    );
  },

  // padded hour 1-12
  G: function(date: Date, locale: Locale, options: ParsedOptions) {
    return pad(defaultFormatFns.h(date, locale, options));
  },

  // hours with leading zero e.g. 03
  H: (date: Date) => pad(date.getHours()),

  // day (1-30) with ordinal suffix e.g. 1st, 2nd
  J: function(date: Date, locale: Locale) {
    return locale.ordinal !== undefined
      ? date.getDate() + locale.ordinal(date.getDate())
      : date.getDate();
  },

  // AM/PM
  K: (date: Date, locale: Locale) => locale.amPM[int(date.getHours() > 11)],

  // shorthand month e.g. Jan, Sep, Oct, etc
  M: function(date: Date, locale: Locale) {
    return monthToStr(date.getMonth(), true, locale);
  },

  // seconds 00-59
  S: (date: Date) => pad(date.getSeconds()),

  // unix timestamp
  U: (date: Date) => date.getTime() / 1000,

  W: function(date: Date, _: Locale, options: ParsedOptions) {
    return options.getWeek(date);
  },

  // full year e.g. 2016
  Y: (date: Date) => date.getFullYear(),

  // day in month, padded (01-30)
  d: (date: Date) => pad(date.getDate()),

  // hour from 1-12 (am/pm)
  h: (date: Date) => (date.getHours() % 12 ? date.getHours() % 12 : 12),

  // minutes, padded with leading zero e.g. 09
  i: (date: Date) => pad(date.getMinutes()),

  // day in month (1-30)
  j: (date: Date) => date.getDate(),

  // weekday name, full, e.g. Thursday
  l: function(date: Date, locale: Locale) {
    return locale.weekdays.longhand[date.getDay()];
  },

  // padded month number (01-12)
  m: (date: Date) => pad(date.getMonth() + 1),

  // the month number (1-12)
  n: (date: Date) => date.getMonth() + 1,

  // seconds 0-59
  s: (date: Date) => date.getSeconds(),

  // Unix Milliseconds
  u: (date: Date) => date.getTime(),

  // number of the day of the week
  w: (date: Date) => date.getDay(),

  // last two digits of year e.g. 16 for 2016
  y: (date: Date) => String(date.getFullYear()).substring(2),
};
