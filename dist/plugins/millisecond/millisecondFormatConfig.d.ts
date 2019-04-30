import { FlatpickrFn } from "../../types/instance";
declare const millisecondFormatConfig: {
    millisecondFormatFn: {
        v: (date: Date) => string;
    };
    millisecondParseTokenRegex: {
        v: string;
    };
    millisecondParseTokenFn: {
        v: (dateObj: Date, milliseconds: string) => void;
    };
    millisecondFormatStaticConfig: (FlatPickr: FlatpickrFn) => void;
};
export default millisecondFormatConfig;
