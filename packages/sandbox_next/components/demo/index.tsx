/*eslint @typescript-eslint/no-unused-vars: ["off", {"varsIgnorePattern": "^_"}]*/
import React, {Component} from "react";
import {
  Utils, Query, Builder, MuiConfig,
  //types:
  BuilderProps, ImmutableTree, Config, JsonTree, JsonConfig
} from "@react-awesome-query-builder/mui";
import { PostResult, GetResult, PostBody } from "../../pages/api/tree";
import loadedConfig from "./config";
const stringify = JSON.stringify;
const {getTree, checkTree, loadTree, uuid} = Utils;
const { serializeConfig, deserializeConfig } = Utils.ConfigUtils;

const preStyle = { backgroundColor: "darkgrey", margin: "10px", padding: "10px" };
const preErrorStyle = { backgroundColor: "lightpink", margin: "10px", padding: "10px" };

interface DemoQueryBuilderState {
  tree: ImmutableTree;
  config: Config;
  result: PostResult;
}

export type DemoQueryBuilderProps = {
  initValue: JsonTree;
  configStr: JsonConfig;
}

export default class DemoQueryBuilder extends Component<DemoQueryBuilderProps, DemoQueryBuilderState> {

  // state = {
  //   tree: null as ImmutableTree,
  //   config: null as Config,
  //   result: {}
  // }
  state = {
    tree: checkTree(loadTree(this.props.initValue), loadedConfig),
    config: loadedConfig,
    result: {}
  };


  componentDidMount = () => {
    this.updateResult();

    // const config = deserializeConfig(this.props.configStr, MuiConfig.ctx);
    // console.log(config)
    // this.setState({
    //   tree: checkTree(loadTree(this.props.initValue), config),
    //   config,
    //   result: {}
    // }, () => {
    //   this.updateResult();
    // });
  };

  render = () => {
    console.log(2, this.state.config, loadedConfig)
    return (
    <div>
      <Query 
        {...this.state.config} 
        value={this.state.tree}
        onChange={this.onChange}
        renderBuilder={this.renderBuilder}
      />

      <button onClick={this.resetValue}>reset</button>
      <button onClick={this.clearValue}>clear</button>

      <div className="query-builder-result">
        {this.renderResult(this.state)}
      </div>
    </div>
    );
  }

  resetValue = () => {
    (async () => {
      const response = await fetch("/api/tree" + "?initial=true", {
        method: "DELETE",
      });
      const result = await response.json() as GetResult;
      const tree: JsonTree = result.tree;

      this.setState({
        tree: loadTree(tree), 
      });
    })();
  };

  clearValue = () => {
    const emptyInitValue: JsonTree = {"id": uuid(), "type": "group"};
    this.setState({
      tree: loadTree(emptyInitValue), 
    });
  };

  renderBuilder = (props: BuilderProps) => (
    <div className="query-builder-container" style={{padding: "10px"}}>
      <div className="query-builder qb-lite">
        <Builder {...props} />
      </div>
    </div>
  );
    
  onChange = (tree: ImmutableTree, config: Config) => {
    console.log('ch config', config, config === this.state.config)
    console.log('ch tree', getTree(tree))
    this.setState({
      tree, 
      config
    }, () => {
      this.updateResult();
    });
  };

  updateResult = async () => {
    const jsonTree = getTree(this.state.tree);
    const jsonConfig = serializeConfig(this.state.config);
    console.log( 'updateResult config', deserializeConfig(jsonConfig, this.state.config.ctx) );
    console.log( 'updateResult tree', jsonTree );

    const response = await fetch("/api/tree", {
      method: "POST",
      body: JSON.stringify({
        jsonTree,
        jsonConfig
      } as PostBody),
    });
    const result = await response.json() as PostResult;
    this.setState({result});
  };

  renderResult = ({result: {jl, qs, qsh, sql, mongo}, tree: immutableTree} : {result: PostResult, tree: ImmutableTree}) => {
    if(!jl) return null;
    const {logic, data, errors} = jl;
    return (
      <div>
        <br />
        <div>
          stringFormat: 
          <pre style={preStyle}>
            {stringify(qs, undefined, 2)}
          </pre>
        </div>
        <hr/>
        <div>
          humanStringFormat: 
          <pre style={preStyle}>
            {stringify(qsh, undefined, 2)}
          </pre>
        </div>
        <hr/>
        <div>
          sqlFormat: 
          <pre style={preStyle}>
            {stringify(sql, undefined, 2)}
          </pre>
        </div>
        <hr/>
        <div>
          mongodbFormat: 
          <pre style={preStyle}>
            {stringify(mongo, undefined, 2)}
          </pre>
        </div>
        <hr/>
        <div>
          <a href="http://jsonlogic.com/play.html" target="_blank" rel="noopener noreferrer">jsonLogicFormat</a>: 
          { errors.length > 0 
              && <pre style={preErrorStyle}>
                {stringify(errors, undefined, 2)}
              </pre> 
          }
          { !!logic
              && <pre style={preStyle}>
                {"// Rule"}:<br />
                {stringify(logic, undefined, 2)}
                <br />
                <hr />
                {"// Data"}:<br />
                {stringify(data, undefined, 2)}
              </pre>
          }
        </div>
        <hr/>
        <div>
          Tree: 
          <pre style={preStyle}>
            {stringify(getTree(immutableTree), undefined, 2)}
          </pre>
        </div>
      </div>
    );
  };

}
