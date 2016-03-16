'use strict';

import expect from 'expect';
import Immutable from 'immutable';
import {queryBuilderToTree} from 'modules/utils/queryBuilderFormat.js';

describe('Example', () => {
    const ruleset = {
        "condition": "AND",
        "rules": [
            {
                "id": "price",
                "field": "price",
                "type": "double",
                "input": "text",
                "operator": "less",
                "value": "10.25"
            },
            {
                "condition": "OR",
                "rules": [
                    {
                        "id": "category",
                        "field": "category",
                        "type": "integer",
                        "input": "select",
                        "operator": "equal",
                        "value": "2"
                    },
                    {
                        "id": "category",
                        "field": "category",
                        "type": "integer",
                        "input": "select",
                        "operator": "equal",
                        "value": "1"
                    }
                ]
            }
        ]
    }
    it('test Immutable', () => {
        expect(Immutable).toExist();
    })
    it('test correct tree', () => {
        var tree = queryBuilderToTree(ruleset);
        console.dir(tree.toJS())
        expect(tree).toExist();
    })
})
