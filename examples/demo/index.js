import React, {Component} from 'react';
import {Query, Builder, Preview, Utils} from 'react-awesome-query-builder';
const {queryBuilderFormat, queryBuilderToTree, extendConfig} = Utils;
import config from './config';

var stringify = require('json-stringify-safe');

let ruleset = {
    "condition": "AND",
    "rules": [
        {
            "id": "name",
            "field": "name",
            "type": "string",
            "input": "text",
            "operator": "less",
            "value": "test name"
        },
        {
            "condition": "OR",
            "rules": [
                {
                    "id": "category",
                    "field": "date",
                    "type": "date",
                    "input": "date",
                    "operator": "equal",
                    "value": "2012-01-12"
                },
                {
                    "id": "category",
                    "field": "name",
                    "type": "string",
                    "input": "text",
                    "operator": "equal",
                    "value": "1"
                }
            ]
        }
    ]
}

export default class DemoQueryBuilder extends Component {
    getChildren(props) {
        return (
            <div>
                <div>queryBuilderFormat: {stringify(queryBuilderFormat(props.tree, props.config))}</div>
                <div>Tree: {stringify(props.tree)}</div>
                <div className="query-builder">
                    <Builder {...props} />
                </div>
            </div>
        )
    }

    render() {
        const {tree, ...config_props} = config;
        //<Query {...config_props} value={queryBuilderToTree(ruleset)} get_children={this.getChildren}> </Query>
                
        return (
            <div>
                <Query {...config_props} get_children={this.getChildren}> </Query>
            </div>
        );
    }
}
