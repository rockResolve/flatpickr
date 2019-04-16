import { DateOption, Options, ParsedOptions } from "./options";
import { Locale, CustomLocale, key as LocaleKey } from "./locale";

export interface Elements {
  element: HTMLElement;
  input: HTMLInputElement;
  altInput?: HTMLInputElement;
  _input: HTMLInputElement;
  mobileInput?: HTMLInputElement;
  mobileFormatStr?: string;

  selectedDateElem?: DayElement;
  todayDateElem?: DayElement;

  _positionElement: HTMLElement;
  weekdayContainer: HTMLDivElement;
  calendarContainer: HTMLDivElement;
  innerContainer?: HTMLDivElement;
  rContainer?: HTMLDivElement;
  daysContainer?: HTMLDivElement;
  days: HTMLDivElement;

  weekWrapper?: HTMLDivElement;
  weekNumbers?: HTMLDivElement;

  // month nav
  monthNav: HTMLDivElement;

  yearElements: HTMLInputElement[];
  monthElements: HTMLSpanElement[];

  // month nav getters
  currentYearElement: HTMLInputElement;
  currentMonthElement: HTMLSpanElement;

  // month nav arrows
  _hidePrevMonthArrow: boolean;
  _hideNextMonthArrow: boolean;
  prevMonthNav: HTMLElement;
  nextMonthNav: HTMLElement;

  timeContainer?: HTMLDivElement;
  hourElement?: HTMLInputElement;
  minuteElement?: HTMLInputElement;
  secondElement?: HTMLInputElement;
  amPM?: HTMLSpanElement;

  pluginElements: Array<Node>;
}


export type Instance = Elements &
  {
    // Dates
    minRangeDate?: Date;
    maxRangeDate?: Date;
    now: Date;
    latestSelectedDateObj?: Date;
    _selectedDateObj?: Date;
    selectedDates: Date[];
    _initialDate: Date;

    // State
    config: ParsedOptions;
    loadedPlugins: string[];
    l10n: Locale;

    currentYear: number;
    currentMonth: number;

    isOpen: boolean;
    isMobile: boolean;

    minDateHasTime: boolean;
    maxDateHasTime: boolean;

    showTimeInput: boolean;
    _showTimeInput: boolean;

    // Methods
    changeMonth: (
      value: number,
      is_offset?: boolean,
      from_keyboard?: boolean
    ) => void;
    changeYear: (year: number) => void;
    clear: (emitChangeEvent?: boolean, toInitial?: boolean) => void;
    close: () => void;
    destroy: () => void;
    isEnabled: (date: DateOption, timeless?: boolean) => boolean;
    jumpToDate: (date?: DateOption) => void;
    open: (e?: FocusEvent | MouseEvent, positionElement?: HTMLElement) => void;
    redraw: () => void;
    set: (
      option: keyof Options | { [k in keyof Options]?: Options[k] },
      value?: any
    ) => void;

    /**
     * @param triggerChange trigger flatPickr onChange event
     * @param format defaults to config.dateFormat. You may want to use config.altFormat
     */
    setDate: (
      date: DateOption | DateOption[],
      triggerChange?: boolean,
      format?: string,
      doSkipUpdateInputElement?: boolean
    ) => void;
    toggle: () => void;

    pad: (num: string | number) => string;
    parseDate: (
      date: Date | string | number,
      givenFormat?: string,
      timeless?: boolean
    ) => Date | undefined;
    formatDate: (dateObj: Date, frmt: string) => string;

    // Internals

    _handlers: {
      event: string;
      element: Element;
      handler: (e?: Event) => void;
      options?: { capture?: boolean };
    }[];

    _bind: <E extends Element>(
      element: E | E[],
      event: string | string[],
      handler: (e?: any) => void
    ) => void;
    _createElement: <E extends HTMLElement>(
      tag: keyof HTMLElementTagNameMap,
      className: string,
      content?: string
    ) => E;
    _setHoursFromDate: (date: Date) => void;
    _debouncedChange: () => void;
    __hideNextMonthArrow: boolean;
    __hidePrevMonthArrow: boolean;
    _positionCalendar: (customPositionElement?: HTMLElement) => void;

    utils: {
      getDaysInMonth: (monthIndex?: number, centuryYear?: number) => number;
    };
  };

export interface FlatpickrFn {
  (selector: Node, config?: Options): Instance;
  (selector: ArrayLike<Node>, config?: Options): Instance[];
  (selector: string, config?: Options): Instance | Instance[];
  defaultConfig: Partial<ParsedOptions>;

  /** Get current global config i.e. the union of application defaults & global default config.
   * Used by static parseDate, formatDate as well as new FlatPickr instances */
  getGlobalConfig: () => ParsedOptions;
  l10ns: { [k in LocaleKey]?: CustomLocale } & { default: Locale };
  localize: (l10n: CustomLocale) => void;

  /** Set global default config. Combined with application defaults to be
   * used by static parseDate, formatDate as well as new FlatPickr instances */
  setDefaults: (config: Options) => void;
  parseDate: (
    date: DateOption,
    format?: string,
    timeless?: boolean
  ) => Date | undefined;
  formatDate: (date: Date, format: string) => string;
  compareDates: (date1: Date, date2: Date, timeless?: boolean) => number;
}

export type DayElement = HTMLSpanElement & { dateObj: Date; $i: number };
