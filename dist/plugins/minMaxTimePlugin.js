(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.minMaxTimePlugin = factory());
}(this, function () { 'use strict';

  var pad = function (number, digits) {
      if (digits === void 0) { digits = 2; }
      return (Array(digits).join("0") //IE compatible repeat
          + number).slice(digits * -1);
  };
  var int = function (bool) { return (bool === true ? 1 : 0); };

  var do_nothing = function () { return undefined; };
  var monthToStr = function (monthNumber, shorthand, locale) { return locale.months[shorthand ? "shorthand" : "longhand"][monthNumber]; };
  var monthStrToDate = function (monthName, shorthand, locale, dateObj) {
      // Handle wrong case of input monthName
      // Note: Some locales have 1 character shorthand months.
      if (monthName.length > 1) {
          monthName =
              monthName[0].toUpperCase() + monthName.substring(1).toLowerCase();
      }
      var monthIndex = locale.months[shorthand ? "shorthand" : "longhand"].indexOf(monthName);
      if (monthIndex > -1) {
          dateObj.setMonth(monthIndex);
      }
  };
  function getDaysInMonth(monthIndex, centuryYear, locale) {
      if (monthIndex === 1 && ((centuryYear % 4 === 0 && centuryYear % 100 !== 0) || centuryYear % 400 === 0))
          return 29;
      return locale.daysInMonth[monthIndex];
  }
  var defaultParseTokenFns = {
      D: do_nothing,
      F: function (dateObj, monthName, locale) {
          monthStrToDate(monthName, false, locale, dateObj);
      },
      G: function (dateObj, hour) {
          dateObj.setHours(parseFloat(hour));
      },
      H: function (dateObj, hour) {
          dateObj.setHours(parseFloat(hour));
      },
      J: function (dateObj, day, locale) {
          var dayNumber = parseFloat(day);
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
      K: function (dateObj, amPM, locale) {
          dateObj.setHours((dateObj.getHours() % 12) +
              12 * int(new RegExp(locale.amPM[1], "i").test(amPM)));
      },
      M: function (dateObj, shortMonth, locale) {
          monthStrToDate(shortMonth, true, locale, dateObj);
      },
      S: function (dateObj, seconds) {
          dateObj.setSeconds(parseFloat(seconds));
      },
      U: function (_, unixSeconds) { return new Date(parseFloat(unixSeconds) * 1000); },
      W: function (dateObj, weekNum, locale) {
          var weekNumber = parseInt(weekNum);
          var date = new Date(dateObj.getFullYear(), 0, 2 + (weekNumber - 1) * 7, 0, 0, 0, 0);
          date.setDate(date.getDate() - date.getDay() + locale.firstDayOfWeek);
          return date;
      },
      Y: function (dateObj, year) {
          dateObj.setFullYear(parseFloat(year));
      },
      Z: function (_, ISODate) { return new Date(ISODate); },
      d: function (dateObj, day, locale) {
          defaultParseTokenFns.J(dateObj, day, locale);
      },
      h: function (dateObj, hour) {
          dateObj.setHours(parseFloat(hour));
      },
      i: function (dateObj, minutes) {
          dateObj.setMinutes(parseFloat(minutes));
      },
      j: function (dateObj, day, locale) {
          defaultParseTokenFns.J(dateObj, day, locale);
      },
      l: do_nothing,
      m: function (dateObj, month) {
          var monthNumber = parseFloat(month);
          if (monthNumber >= 1 && monthNumber <= 12) {
              dateObj.setMonth(monthNumber - 1);
          }
      },
      n: function (dateObj, month, locale) {
          defaultParseTokenFns.m(dateObj, month, locale);
      },
      s: function (dateObj, seconds) {
          dateObj.setSeconds(parseFloat(seconds));
      },
      u: function (_, unixMillSeconds) {
          return new Date(parseFloat(unixMillSeconds));
      },
      w: do_nothing,
      y: function (dateObj, year) {
          dateObj.setFullYear(2000 + parseFloat(year));
      }
  };
  var defaultParseTokenRegexs = {
      D: "(\\w+)",
      F: "(\\w+)",
      G: "(\\d\\d|\\d)",
      H: "(\\d\\d|\\d)",
      J: "(\\d\\d|\\d)\\w+",
      K: function (locale) { return "(" + locale.amPM[0] + "|" + locale.amPM[1]
          + ("|" + locale.amPM[0].toLowerCase() + "|" + locale.amPM[1].toLowerCase() + ")"); },
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
      y: "(\\d{2})"
  };
  var defaultParseTokenOrders = {
      y: 1,
      Y: 1,
      F: 2,
      m: 2,
      n: 2,
      M: 2
  };
  var defaultFormatFns = {
      // get the date in UTC
      Z: function (date) { return date.toISOString(); },
      // weekday name, short, e.g. Thu
      D: function (date, locale, options) {
          return locale.weekdays.shorthand[defaultFormatFns.w(date, locale, options)];
      },
      // full month name e.g. January
      F: function (date, locale, options) {
          return monthToStr(defaultFormatFns.n(date, locale, options) - 1, false, locale);
      },
      // padded hour 1-12
      G: function (date, locale, options) {
          return pad(defaultFormatFns.h(date, locale, options));
      },
      // hours with leading zero e.g. 03
      H: function (date) { return pad(date.getHours()); },
      // day (1-30) with ordinal suffix e.g. 1st, 2nd
      J: function (date, locale) {
          return locale.ordinal !== undefined
              ? date.getDate() + locale.ordinal(date.getDate())
              : date.getDate();
      },
      // AM/PM
      K: function (date, locale) { return locale.amPM[int(date.getHours() > 11)]; },
      // shorthand month e.g. Jan, Sep, Oct, etc
      M: function (date, locale) {
          return monthToStr(date.getMonth(), true, locale);
      },
      // seconds 00-59
      S: function (date) { return pad(date.getSeconds()); },
      // unix timestamp
      U: function (date) { return date.getTime() / 1000; },
      W: function (date, _, options) {
          return options.getWeek(date);
      },
      // full year e.g. 2016
      Y: function (date) { return date.getFullYear(); },
      // day in month, padded (01-30)
      d: function (date) { return pad(date.getDate()); },
      // hour from 1-12 (am/pm)
      h: function (date) { return (date.getHours() % 12 ? date.getHours() % 12 : 12); },
      // minutes, padded with leading zero e.g. 09
      i: function (date) { return pad(date.getMinutes()); },
      // day in month (1-30)
      j: function (date) { return date.getDate(); },
      // weekday name, full, e.g. Thursday
      l: function (date, locale) {
          return locale.weekdays.longhand[date.getDay()];
      },
      // padded month number (01-12)
      m: function (date) { return pad(date.getMonth() + 1); },
      // the month number (1-12)
      n: function (date) { return date.getMonth() + 1; },
      // seconds 0-59
      s: function (date) { return date.getSeconds(); },
      // Unix Milliseconds
      u: function (date) { return date.getTime(); },
      // number of the day of the week
      w: function (date) { return date.getDay(); },
      // last two digits of year e.g. 16 for 2016
      y: function (date) { return String(date.getFullYear()).substring(2); }
  };

  var defaults = {
      _disable: [],
      _enable: [],
      allowInput: false,
      altFormat: "F j, Y",
      altInput: false,
      altInputClass: "form-control input",
      animate: typeof window === "object" &&
          window.navigator.userAgent.indexOf("MSIE") === -1,
      ariaDateFormat: "F j, Y",
      clickOpens: true,
      closeOnSelect: true,
      conjunction: ", ",
      dateFormat: "Y-m-d",
      defaultHour: 12,
      defaultMinute: 0,
      defaultSeconds: 0,
      disable: [],
      disableMobile: false,
      enable: [],
      enableSeconds: false,
      enableTime: false,
      errorHandler: function (err) {
          return typeof console !== "undefined" && console.warn(err);
      },
      formatFns: defaultFormatFns,
      getWeek: function (givenDate) {
          var date = new Date(givenDate.getTime());
          date.setHours(0, 0, 0, 0);
          // Thursday in current week decides the year.
          date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
          // January 4 is always in week 1.
          var week1 = new Date(date.getFullYear(), 0, 4);
          // Adjust to Thursday in week 1 and count number of weeks from date to week1.
          return (1 +
              Math.round(((date.getTime() - week1.getTime()) / 86400000 -
                  3 +
                  ((week1.getDay() + 6) % 7)) /
                  7));
      },
      hourIncrement: 1,
      ignoredFocusElements: [],
      inline: false,
      locale: "default",
      minuteIncrement: 5,
      mode: "single",
      nextArrow: "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M13.207 8.472l-7.854 7.854-0.707-0.707 7.146-7.146-7.146-7.148 0.707-0.707 7.854 7.854z' /></svg>",
      noCalendar: false,
      now: new Date(),
      onChange: [],
      onClose: [],
      onDayCreate: [],
      onDestroy: [],
      onKeyDown: [],
      onMonthChange: [],
      onOpen: [],
      onParseConfig: [],
      onReady: [],
      onValueUpdate: [],
      onYearChange: [],
      onPreCalendarPosition: [],
      parseTokenFns: defaultParseTokenFns,
      parseTokenRegexs: defaultParseTokenRegexs,
      parseTokenOrders: defaultParseTokenOrders,
      plugins: [],
      position: "auto",
      positionElement: undefined,
      prevArrow: "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M5.207 8.471l7.146 7.147-0.707 0.707-7.853-7.854 7.854-7.853 0.707 0.707-7.147 7.146z' /></svg>",
      shorthandCurrentMonth: false,
      showMonths: 1,
      static: false,
      time_24hr: false,
      weekNumbers: false,
      wrap: false
  };

  var english = {
      weekdays: {
          shorthand: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          longhand: [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
          ]
      },
      months: {
          shorthand: [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
          ],
          longhand: [
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
          ]
      },
      daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
      firstDayOfWeek: 0,
      ordinal: function (nth) {
          var s = nth % 100;
          if (s > 3 && s < 21)
              return "th";
          switch (s % 10) {
              case 1:
                  return "st";
              case 2:
                  return "nd";
              case 3:
                  return "rd";
              default:
                  return "th";
          }
      },
      rangeSeparator: " to ",
      weekAbbreviation: "Wk",
      scrollTitle: "Scroll to increment",
      toggleTitle: "Click to toggle",
      amPM: ["AM", "PM"],
      yearAriaLabel: "Year",
      time_24hr: false
  };

  var createDateFormatter = function (_a) {
      var _b = _a.config, config = _b === void 0 ? defaults : _b, _c = _a.l10n, l10n = _c === void 0 ? english : _c;
      return function (dateObj, frmt, overrideLocale) {
          var locale = overrideLocale || l10n;
          if (config.formatDate !== undefined) {
              return config.formatDate(dateObj, frmt, locale);
          }
          return frmt
              .split("")
              .map(function (c, i, arr) {
              return config.formatFns[c] && arr[i - 1] !== "\\"
                  ? config.formatFns[c](dateObj, locale, config)
                  : c !== "\\"
                      ? c
                      : "";
          })
              .join("");
      };
  };
  /**
   * Compute the difference in dates, measured in ms
   */
  function compareDates(date1, date2, timeless) {
      if (timeless === void 0) { timeless = true; }
      if (timeless !== false) {
          return (new Date(date1.getTime()).setHours(0, 0, 0, 0) -
              new Date(date2.getTime()).setHours(0, 0, 0, 0));
      }
      return date1.getTime() - date2.getTime();
  }
  /**
   * Compute the difference in times, measured in ms
   */
  function compareTimes(date1, date2) {
      return (3600000 * (date1.getHours() - date2.getHours()) +
          60000 * (date1.getMinutes() - date2.getMinutes()) +
          1000 * date1.getSeconds() - date2.getSeconds() +
          date1.getMilliseconds() - date2.getMilliseconds());
  }

  function minMaxTimePlugin(config) {
      if (config === void 0) { config = {}; }
      var state = {
          formatDate: createDateFormatter({}),
          tableDateFormat: config.tableDateFormat || "Y-m-d",
          defaults: {
              minTime: undefined,
              maxTime: undefined
          }
      };
      function findDateTimeLimit(date) {
          if (config.table !== undefined) {
              return config.table[state.formatDate(date, state.tableDateFormat)];
          }
          return config.getTimeLimits && config.getTimeLimits(date);
      }
      return function (fp) {
          return {
              onReady: function () {
                  state.formatDate = this.formatDate;
                  state.defaults = {
                      minTime: this.config.minTime && state.formatDate(this.config.minTime, "H:i"),
                      maxTime: this.config.maxTime && state.formatDate(this.config.maxTime, "H:i")
                  };
                  fp.loadedPlugins.push("minMaxTime");
              },
              onChange: function () {
                  var latest = this.latestSelectedDateObj;
                  var matchingTimeLimit = latest && findDateTimeLimit(latest);
                  if (latest && matchingTimeLimit !== undefined) {
                      this.set(matchingTimeLimit);
                      fp.config.minTime.setFullYear(latest.getFullYear());
                      fp.config.maxTime.setFullYear(latest.getFullYear());
                      fp.config.minTime.setMonth(latest.getMonth());
                      fp.config.maxTime.setMonth(latest.getMonth());
                      fp.config.minTime.setDate(latest.getDate());
                      fp.config.maxTime.setDate(latest.getDate());
                      if (compareDates(latest, fp.config.maxTime, false) > 0) {
                          fp.setDate(new Date(latest.getTime()).setHours(fp.config.maxTime.getHours(), fp.config.maxTime.getMinutes(), fp.config.maxTime.getSeconds(), fp.config.maxTime.getMilliseconds()), false);
                      }
                      else if (compareDates(latest, fp.config.minTime, false) < 0)
                          fp.setDate(new Date(latest.getTime()).setHours(fp.config.minTime.getHours(), fp.config.minTime.getMinutes(), fp.config.minTime.getSeconds(), fp.config.minTime.getMilliseconds()), false);
                  }
                  else {
                      var newMinMax = state.defaults || {
                          minTime: undefined,
                          maxTime: undefined
                      };
                      this.set(newMinMax);
                      if (!latest)
                          return;
                      var _a = fp.config, minTime = _a.minTime, maxTime = _a.maxTime;
                      if (minTime && compareTimes(latest, minTime) < 0) {
                          fp.setDate(new Date(latest.getTime()).setHours(minTime.getHours(), minTime.getMinutes(), minTime.getSeconds(), minTime.getMilliseconds()), false);
                      }
                      else if (maxTime && compareTimes(latest, maxTime) > 0) {
                          fp.setDate(new Date(latest.getTime()).setHours(maxTime.getHours(), maxTime.getMinutes(), maxTime.getSeconds(), maxTime.getMilliseconds()));
                      }
                      //
                  }
              }
          };
      };
  }

  return minMaxTimePlugin;

}));
