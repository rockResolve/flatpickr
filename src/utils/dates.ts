import { Locale } from "../types/locale";
import { ParseTokenFn } from "./formatting";
import { defaults } from "../types/options";
import { english } from "../l10n/default";

export const createDateFormatter = ({ config = defaults, l10n = english }) => (
  dateObj: Date,
  frmt: string,
  overrideLocale?: Locale
): string => {
  const locale = overrideLocale || l10n;

  if (config.formatDate !== undefined) {
    return config.formatDate(dateObj, frmt, locale);
  }

  return frmt
    .split("")
    .map((c, i, arr) =>
      config.formatFns[c] && arr[i - 1] !== "\\"
        ? config.formatFns[c](dateObj, locale, config)
        : c !== "\\"
        ? c
        : ""
    )
    .join("");
};

export const createDateParser = ({ config = defaults, l10n = english }) => (
  date: Date | string | number,
  givenFormat?: string,
  timeless?: boolean,
  customLocale?: Locale
): Date | undefined => {
  if (date !== 0 && !date) return undefined;

  const locale = customLocale || l10n;

  let parsedDate: Date | undefined;
  const date_orig = date;

  if (date instanceof Date) parsedDate = new Date(date.getTime());
  else if (
    typeof date !== "string" &&
    date.toFixed !== undefined // timestamp
  )
    // create a copy

    parsedDate = new Date(date);
  else if (typeof date === "string") {
    // date string
    const format = givenFormat || (config || defaults).dateFormat;
    const datestr = String(date).trim();

    if (datestr === "today") {
      parsedDate = new Date();
      timeless = true;
    } else if (
      /Z$/.test(datestr) ||
      /GMT$/.test(datestr) // datestrings w/ timezone
    )
      parsedDate = new Date(date);
    else if (config && config.parseDate)
      parsedDate = config.parseDate(date, format);
    else {
      parsedDate =
        !config || !config.noCalendar
          ? new Date(new Date().getFullYear(), 0, 1, 0, 0, 0, 0)
          : (new Date(new Date().setHours(0, 0, 0, 0)) as Date);

      let matched,
        ops: { fn: ParseTokenFn; val: string }[] = [];

      for (let i = 0, matchIndex = 0, regexStr = ""; i < format.length; i++) {
        const token = format[i];
        const isBackSlash = token === "\\";
        const escaped = format[i - 1] === "\\" || isBackSlash;

        if (config.parseTokenRegexs[token] && !escaped) {
          regexStr += config.parseTokenRegexs[token];
          const match = new RegExp(regexStr).exec(date);
          if (match && (matched = true)) {
            ops[token !== "Y" ? "push" : "unshift"]({
              fn: config.parseTokenFns[token],
              val: match[++matchIndex],
            });
          }
        } else if (!isBackSlash) regexStr += "."; // don't really care

        ops.forEach(
          ({ fn, val }) =>
            (parsedDate = fn(parsedDate as Date, val, locale) || parsedDate)
        );
      }

      parsedDate = matched ? parsedDate : undefined;
    }
  }

  /* istanbul ignore next */
  if (!(parsedDate instanceof Date && !isNaN(parsedDate.getTime()))) {
    config.errorHandler(new Error(`Invalid date provided: ${date_orig}`));
    return undefined;
  }

  if (timeless === true) parsedDate.setHours(0, 0, 0, 0);

  return parsedDate;
};

/**
 * Compute the difference in dates, measured in ms
 */
export function compareDates(date1: Date, date2: Date, timeless = true) {
  if (timeless !== false) {
    return (
      new Date(date1.getTime()).setHours(0, 0, 0, 0) -
      new Date(date2.getTime()).setHours(0, 0, 0, 0)
    );
  }

  return date1.getTime() - date2.getTime();
}

/**
 * Compute the difference in times, measured in ms
 */
export function compareTimes(date1: Date, date2: Date) {
  return (
    3600 * (date1.getHours() - date2.getHours()) +
    60 * (date1.getMinutes() - date2.getMinutes()) +
    date1.getSeconds() -
    date2.getSeconds()
  );
}

export const isBetween = (ts: number, ts1: number, ts2: number) => {
  return ts > Math.min(ts1, ts2) && ts < Math.max(ts1, ts2);
};

export const duration = {
  DAY: 86400000,
};
