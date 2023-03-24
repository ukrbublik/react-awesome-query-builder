/*eslint @typescript-eslint/no-unused-vars: ["off", {"varsIgnorePattern": "^_"}]*/
import React, {Component} from "react";
import {
  Utils, Query, Builder, MuiConfig,
  //types:
  BuilderProps, ImmutableTree, Config, JsonTree, ZipConfig
} from "@react-awesome-query-builder/mui";
import { PostTreeResult, GetTreeResult, PostTreeBody } from "../../pages/api/tree";
import { PostConfigBody, PostConfigResult } from "../../pages/api/config";
import ctx from "./config_ctx";
import updateConfigWithSomeChanges from "./config_update";
const stringify = JSON.stringify;
const {getTree, checkTree, loadTree, uuid} = Utils;

const preStyle = { backgroundColor: "darkgrey", margin: "10px", padding: "10px" };
const preErrorStyle = { backgroundColor: "lightpink", margin: "10px", padding: "10px" };

export type DemoQueryBuilderProps = {
  jsonTree: JsonTree;
  zipConfig: ZipConfig;
}

interface DemoQueryBuilderState {
  tree: ImmutableTree;
  config: Config;
  result: PostTreeResult;
}

export default class DemoQueryBuilder extends Component<DemoQueryBuilderProps, DemoQueryBuilderState> {

  constructor(props: DemoQueryBuilderProps) {
    super(props);
    const config = Utils.ConfigUtils.decompressConfig(props.zipConfig, MuiConfig, ctx);
    this.state = {
      tree: checkTree(loadTree(props.jsonTree), config),
      config,
      result: {},
    };
  }

  componentDidMount = () => {
    this.updateResult();
  };

  render = () => {
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
        <button onClick={this.updateConfig}>update config</button>

        <div className="query-builder-result">
          {this.renderResult(this.state)}
        </div>
      </div>
    );
  };

  resetValue = () => {
    (async () => {
      const response = await fetch("/api/tree" + "?initial=true", {
        method: "DELETE",
      });
      const result = await response.json() as GetTreeResult;

      this.setState({
        tree: loadTree(result.tree), 
      });
    })();
  };

  clearValue = () => {
    const emptyInitValue: JsonTree = {"id": uuid(), "type": "group"};
    this.setState({
      tree: loadTree(emptyInitValue), 
    });
  };
  
  updateConfig = () => {
    (async () => {
      const config = updateConfigWithSomeChanges(this.state.config);
      const zipConfig = Utils.ConfigUtils.compressConfig(config, MuiConfig);
      const response = await fetch("/api/config", {
        method: "POST",
        body: JSON.stringify({
          zipConfig,
        } as PostConfigBody),
      });
      const result = await response.json() as PostConfigResult;

      this.setState({
        tree: checkTree(this.state.tree, config),
        config,
      });
    })();
  };

  renderBuilder = (props: BuilderProps) => (
    <div className="query-builder-container" style={{padding: "10px"}}>
      <div className="query-builder qb-lite">
        <Builder {...props} />
      </div>
    </div>
  );
    
  onChange = (tree: ImmutableTree, config: Config) => {
    this.setState({
      tree,
    }, () => {
      this.updateResult();
    });
  };

  updateResult = async () => {
    const jsonTree = getTree(this.state.tree);

    const response = await fetch("/api/tree", {
      method: "POST",
      body: JSON.stringify({
        jsonTree,
      } as PostTreeBody),
    });
    const result = await response.json() as PostTreeResult;
    this.setState({result});
  };

  renderResult = ({result: {jl, qs, qsh, sql, mongo}, tree: immutableTree} : {result: PostTreeResult, tree: ImmutableTree}) => {
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
