import React, {Component} from 'react';
import {Query, Builder, Preview} from 'react-query-builder';
import {queryBuilderFormat, queryBuilderToTree} from 'react-query-builder/utils';
import config from './config';

var stringify = require('json-stringify-safe');

const ruleset = {
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
                <div>{stringify(queryBuilderFormat(props.tree, props.config))}</div>
                <div className="query-builder">
                    <Builder {...props} />
                </div>
            </div>
        )
    }

    render() {
        const {tree, ...config_props} = config;
        
        return (
            <div>
                <Query {...config_props} value={queryBuilderToTree(ruleset)} get_children={this.getChildren}> </Query>
                <Query {...config_props} value={queryBuilderToTree(ruleset)} get_children={this.getChildren}> </Query>
                <Query {...config_props} get_children={this.getChildren}> </Query>
            </div>
        );
    }
}
