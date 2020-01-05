let SqlString = require('sqlstring');

SqlString.trim = (val) => {
    if (val.charAt(0) == "'")
        return val.substring(1, val.length-1);
    else
        return val;
};

SqlString.escapeLike = (val) => {
    // normal escape
    let res = SqlString.escape(val);
    // unwrap ''
    res = SqlString.trim(res);
    // escape % and _
    res = res.replace(/[%_]/g, '\\$&');
    // wrap with % for LIKE
    res = "%" + res + "%";
    // wrap ''
    res = "'" + res + "'";
    return res;
};

export {SqlString};
