import { Locale } from "../types/locale";
export declare const createDateFormatter: ({ config, l10n }: {
    config?: import("../types/options").ParsedOptions | undefined;
    l10n?: Locale | undefined;
}) => (dateObj: Date, frmt: string, overrideLocale?: Locale | undefined) => string;
export declare const createDateParser: ({ config, l10n }: {
    config?: import("../types/options").ParsedOptions | undefined;
    l10n?: Locale | undefined;
}) => (date: string | number | Date, givenFormat?: string | undefined, timeless?: boolean | undefined, customLocale?: Locale | undefined) => Date | undefined;
export declare function compareDates(date1: Date, date2: Date, timeless?: boolean): number;
export declare function compareTimes(date1: Date, date2: Date): number;
export declare const isBetween: (ts: number, ts1: number, ts2: number) => boolean;
export declare const duration: {
    DAY: number;
};
