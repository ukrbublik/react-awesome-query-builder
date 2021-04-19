import React, {Component} from 'react';
import { Row, Col } from 'antd';
import {Query, Builder, Utils} from '../../modules';
import config from './config.sample';
// import config from './config';
// import '../../css/reset.less';
// import '../../css/styles.less';
// import '../../css/compact_styles.less';
// import '../../css/denormalize.less';
// import '../../css/bdh.less';
import { fromJS } from 'immutable';

const {queryBuilderFormat, queryString, mongodbFormat, fromJSON} = Utils;
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
  initValue = '["~#iM",["type","group","id","89ab9b9a-0123-4456-b89a-b16aba36078f","children1",["~#iOM",["aa98b889-89ab-4cde-b012-316ac473d51d",["^0",["type","group","id","aa98b889-89ab-4cde-b012-316ac473d51d","properties",["^0",["conjunction","AND"]],"path",["~#iL",["89ab9b9a-0123-4456-b89a-b16aba36078f","aa98b889-89ab-4cde-b012-316ac473d51d"]],"children1",["^1",["aba999b9-4567-489a-bcde-f16ac473d51d",["^0",["type","rule","id","aba999b9-4567-489a-bcde-f16ac473d51d","properties",["^0",["field","mixin","operator","eq","value",["^2",["2"]],"valueSrc",["^2",["value"]],"operatorOptions",null,"conjunction","AND","valueType",["^2",["text"]]]],"path",["^2",["89ab9b9a-0123-4456-b89a-b16aba36078f","aa98b889-89ab-4cde-b012-316ac473d51d","aba999b9-4567-489a-bcde-f16ac473d51d"]]]]]]]]]],"properties",["^0",["conjunction","AND"]],"path",["^2",["89ab9b9a-0123-4456-b89a-b16aba36078f"]]]]';

  loadTree = fromJSON;
  initValue = '{"usedFields":["mixin"],"rules":[{"rules":[{"id":"aba999b9-4567-489a-bcde-f16ac473d51d","field":"mixin","type":"mixin","input":"text","operator":"eq","values":[{"type":"text","value":"2"}]}],"condition":"AND"}],"condition":"AND"}';
}

export default class DemoQueryBuilder extends Component {
    getChildren(props) {
      const jsonStyle = { backgroundColor: 'darkgrey', margin: '10px', padding: '10px' };

      const queryBuilderJSON = queryBuilderFormat(props.tree, props.config);
      const transFromJSON = (() => {
        try {
          return fromJSON(JSON.stringify(queryBuilderJSON), props.config);
        } catch (error) {
          // console.log('transFromJSON.error', error);
          return {
            error
          };
        }
      })();

      // console.log('tree', props.tree);
      // console.log('trans.tree', transFromJSON);

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
                <Row>
                  <Col span={12}>
                    queryBuilderFormat:
                    <pre style={jsonStyle}>
                      {stringify(queryBuilderJSON, undefined, 2)}
                    </pre>
                  </Col>
                  <Col span={12}>
                    queryBuilderFormat:
                    <pre style={jsonStyle}>
                      {stringify(queryBuilderJSON)}
                    </pre>
                  </Col>
                </Row>
              </div>
              <hr/>
              <div>
                <Row>
                  <Col span={12}>
                    Tree:
                    <pre style={jsonStyle}>
                      {stringify(props.tree, undefined, 2)}
                    </pre>
                  </Col>
                  <Col span={12}>
                    Tree:
                    <pre style={jsonStyle}>
                      {stringify(transFromJSON, undefined, 2)}
                    </pre>
                  </Col>
                </Row>
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
              value={undefined}
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
      // console.log(data, 'data');
    }
}
