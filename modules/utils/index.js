'use strict';
export {queryBuilderFormat, queryBuilderToTree} from './queryBuilderFormat'

export const defaultValue = (value, _default) => {
    return (typeof value === "undefined") ? _default || undefined : value
}

