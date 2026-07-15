import moment from "moment";
import {
  SqlString, sqlEmptyValue,
  stringifyForDisplay, wrapWithBrackets,
} from "../utils/export";
import {
  mongoEmptyValue, mongoFormatOp1, mongoFormatOp2,
} from "../utils/mongoUtils";
import {
  spelFixList, spelEscape,
} from "../utils/spelUtils";
import {
  celEscape,
} from "../utils/celUtils";
import {escapeRegExp} from "../utils/stuff";
import {getTitleInListValues} from "../utils/listValues";


const ctx = {
  utils: {
    SqlString,
    moment,
    mongoFormatOp1,
    mongoFormatOp2,
    mongoEmptyValue,
    escapeRegExp,
    sqlEmptyValue,
    stringifyForDisplay,
    getTitleInListValues,
    celEscape,
    spelEscape,
    spelFixList,
    wrapWithBrackets,
  },
};

export default ctx;
