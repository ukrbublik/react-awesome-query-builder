/*eslint @typescript-eslint/no-unused-vars: ["off", {"varsIgnorePattern": "^_"}]*/
import React, {Component} from "react";
import {
  Utils, Query, Builder, MuiConfig,
  //types:
  BuilderProps, ImmutableTree, Config, JsonTree, ZipConfig
} from "@react-awesome-query-builder/mui";
import type { PostTreeResult, GetTreeResult, PostTreeBody } from "../../pages/api/tree";
import type { PostConfigBody, PostConfigResult } from "../../pages/api/config";
import ctx from "./config_ctx";
import updateConfigWithSomeChanges from "../../lib/config_update";
import { UNSAFE_serializeConfig, UNSAFE_deserializeConfig } from "../../lib/config_ser";
import throttle from "lodash/throttle";
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
    const config = Utils.decompressConfig(props.zipConfig, MuiConfig, ctx);
    const tree = checkTree(loadTree(props.jsonTree), config);
    this.state = {
      tree,
      config,
      result: {},
    };
  }

  componentDidMount = () => {
    console.log("zipConfig:", this.props.zipConfig);
    console.log("ctx:", ctx);
    this._updateResult({ saveTree: false });
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
        <button onClick={this.stringifyConfig}>stringify config</button>

        <div className="query-builder-result">
          {this.renderResult(this.state)}
        </div>
      </div>
    );
  };

  resetValue = () => {
    (async () => {
      const response = await fetch("/api/tree" + "?initial=true");
      const result = await response.json() as GetTreeResult;
      this.setState({
        tree: loadTree(result.jsonTree), 
      });
    })();
  };

  clearValue = () => {
    const emptyInitValue: JsonTree = {"id": uuid(), "type": "group"};
    this.setState({
      tree: loadTree(emptyInitValue), 
    });
  };

  // It's just a test to show ability to serialize an entire config to string and deserialize back
  stringifyConfig = () => {
    const strConfig = UNSAFE_serializeConfig(this.state.config) as string;
    const config = UNSAFE_deserializeConfig(strConfig, ctx) as Config;
    console.log("Deserialized config (click to view):", config.conjunctions.AND.formatConj);
    const spel = Utils.spelFormat(this.state.tree, config);
    const jl = Utils.jsonLogicFormat(this.state.tree, config);
    const mongo = Utils.mongodbFormat(this.state.tree, config);
    const res = {
      spel,
      jl,
      mongo,
    };
    console.log("Format result:", res);
    // this.setState({
    //   tree: checkTree(this.state.tree, config),
    //   config,
    // });
  };
  
  updateConfig = () => {
    (async () => {
      const config = updateConfigWithSomeChanges(this.state.config);
      const zipConfig = Utils.compressConfig(config, MuiConfig);
      const response = await fetch("/api/config", {
        method: "POST",
        body: JSON.stringify({
          zipConfig,
        } as PostConfigBody),
      });
      const _result = await response.json() as PostConfigResult;

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
      tree
    }, () => {
      this.updateResult({ saveTree: true });
    });
  };

  _updateResult = async ({ saveTree } = { saveTree: true }) => {
    const response = await fetch(`/api/tree?saveTree=${saveTree ? "true" : "false"}`, {
      method: "POST",
      body: JSON.stringify({
        jsonTree: getTree(this.state.tree),
      } as PostTreeBody),
    });
    const result = await response.json() as PostTreeResult;
    this.setState({
      result
    });
  };

  updateResult = throttle(this._updateResult, 200);

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
