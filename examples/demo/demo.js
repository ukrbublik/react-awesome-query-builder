import React, {Component} from 'react';
import {Query, Builder, Utils} from '../../modules';
import config from './config';
// import '../../css/reset.less';
import '../../css/styles.less';
import '../../css/compact_styles.less';
import '../../css/denormalize.less';
import { fromJS } from 'immutable';

const {queryBuilderFormat, queryString, mongodbFormat} = Utils;
const stringify = require('json-stringify-safe');
const Immutable = require('immutable');
const transit = require('transit-immutable-js');

// https://github.com/ukrbublik/react-awesome-query-builder/issues/69
const seriazlieAsImmutable = true;

let serializeTree, loadTree, initValue;
if (!seriazlieAsImmutable) {
  serializeTree = function(tree) {
    return JSON.stringify(tree.toJS());
  };
  loadTree = function(serTree) {
    let tree = JSON.parse(serTree);
    return fromJS(tree, (key, value) => {
      let outValue;
      if (key === 'value' && value.get(0) && value.get(0).toJS !== undefined) {
        outValue = Immutable.List.of(value.get(0).toJS());
      } else {
        outValue = Immutable.Iterable.isIndexed(value) ? value.toList() : value.toOrderedMap();
      }
      return outValue;
    });
  };
  initValue = '{"type":"group","id":"9a99988a-0123-4456-b89a-b1607f326fd8","children1":{"a98ab9b9-cdef-4012-b456-71607f326fd9":{"type":"rule","id":"a98ab9b9-cdef-4012-b456-71607f326fd9","properties":{"field":"multicolor","operator":"multiselect_equals","value":[["yellow","green"]],"valueSrc":["value"],"operatorOptions":null,"valueType":["multiselect"]},"path":["9a99988a-0123-4456-b89a-b1607f326fd8","a98ab9b9-cdef-4012-b456-71607f326fd9"]}},"properties":{"conjunction":"AND","not":false},"path":["9a99988a-0123-4456-b89a-b1607f326fd8"]}';
} else {
  serializeTree = transit.toJSON;
  loadTree = transit.fromJSON;
  initValue = '["~#iM",["type","group","id","9a99988a-0123-4456-b89a-b1607f326fd8","children1",["~#iOM",["8ab98baa-0123-4456-b89a-b16a57536c73",["^0",["type","rule","id","8ab98baa-0123-4456-b89a-b16a57536c73","properties",["^0",["field","members.subname","operator","equal","value",["~#iL",["1"]],"valueSrc",["^2",["value"]],"operatorOptions",null,"valueType",["^2",["text"]]]],"path",["^2",["9a99988a-0123-4456-b89a-b1607f326fd8","8ab98baa-0123-4456-b89a-b16a57536c73"]]]]]],"properties",["^0",["conjunction","AND","not",false]],"path",["^2",["9a99988a-0123-4456-b89a-b1607f326fd8"]]]]';
}

export default class DemoQueryBuilder extends Component {
    getChildren(props) {
      const jsonStyle = { backgroundColor: 'darkgrey', margin: '10px', padding: '10px' };
      return (
          <div style={{padding: '10px'}}>
              <div className="query-builder">
                  <Builder {...props} />
              </div>
              <br />
              <div>
                stringFormat:
                <pre style={jsonStyle}>
                  {queryString(props.tree, props.config)}
                </pre>
              </div>
              <hr/>
              <div>
                humanStringFormat:
                <pre style={jsonStyle}>
                  {queryString(props.tree, props.config, true)}
                </pre>
              </div>
              <hr/>
              <div>
                mongodbFormat:
                  <pre style={jsonStyle}>
                    {stringify(mongodbFormat(props.tree, props.config), undefined, 2)}
                  </pre>
              </div>
              <hr/>
              <div>
                queryBuilderFormat:
                  <pre style={jsonStyle}>
                    {stringify(queryBuilderFormat(props.tree, props.config), undefined, 2)}
                  </pre>
              </div>
              <hr/>
              <div>
                Tree:
                <pre style={jsonStyle}>
                  {stringify(props.tree, undefined, 2)}
                </pre>
              </div>
              <hr/>
              <div>
                Serialized Tree:
                <div style={jsonStyle}>
                  {serializeTree(props.tree)}
                </div>
              </div>
          </div>
      );
    }

    render() {
      const {tree, ...configProps} = config;
      return (
          <div>
            <Query
              value={loadTree(initValue)}
              { ...configProps }
              get_children={this.getChildren}
              onChange={this.onChange.bind(this)}
            />
          </div>
      );
    }

    onChange(tree) {
      const data = {
        tree: transit.toJSON(tree),
        json: JSON.stringify(queryBuilderFormat(tree, config))
      };
      console.log(data, 'data');
    }
}
