import React, { Component, PureComponent } from "react";
import { Utils } from "@react-awesome-query-builder/core";
import PropTypes from "prop-types";
import treeStoreReducer from "../stores/tree";
import context from "../stores/context";
import {createStore} from "redux";
import {Provider} from "react-redux";
import * as actions from "../actions";
import {createConfigMemo} from "../utils/configUtils";
import {immutableEqual} from "../utils/stuff";
import {createValidationMemo} from "../utils/validation";
import {liteShouldComponentUpdate, useOnPropsChanged} from "../utils/reactUtils";
import ConnectedQuery from "./Query";
const {defaultRoot} = Utils.DefaultUtils;


export default class QueryContainer extends Component {
  static propTypes = {
    //config
    conjunctions: PropTypes.object.isRequired,
    fields: PropTypes.object.isRequired,
    types: PropTypes.object.isRequired,
    operators: PropTypes.object.isRequired,
    widgets: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,

    onChange: PropTypes.func,
    renderBuilder: PropTypes.func,
    value: PropTypes.any, //instanceOf(Immutable.Map)
  };

  constructor(props, context) {
    super(props, context);
    useOnPropsChanged(this);

    this.getMemoizedConfig = createConfigMemo();
    this.getMemoizedTree = createValidationMemo();
    
    const config = this.getMemoizedConfig(props);
    const tree = props.value;
    const validatedTree = this.getMemoizedTree(config, tree);

    const reducer = treeStoreReducer(config, validatedTree, this.getMemoizedTree);
    const store = createStore(reducer);

    this.state = {
      store,
      config
    };
  }

  shouldComponentUpdate = liteShouldComponentUpdate(this, {
    value: (nextValue, prevValue, state) => { return false; }
  });

  onPropsChanged(nextProps) {
    // compare configs
    const oldConfig = this.state.config;
    const nextConfig = this.getMemoizedConfig(nextProps);
    const isConfigChanged = oldConfig !== nextConfig;

    // compare trees
    const storeValue = this.state.store.getState().tree;
    const isTreeChanged = !immutableEqual(nextProps.value, this.props.value) && !immutableEqual(nextProps.value, storeValue);
    const currentTree = isTreeChanged ? nextProps.value || defaultRoot(nextProps) : storeValue;

    if (isConfigChanged) {
      this.setState({config: nextConfig});
    }
    
    if (isTreeChanged || isConfigChanged) {
      const validatedTree = this.getMemoizedTree(nextConfig, currentTree, oldConfig);
      return Promise.resolve().then(() => {
        this.state.store.dispatch(
          actions.tree.setTree(nextConfig, validatedTree)
        );
      });
    }
  }

  render() {
    // `get_children` is deprecated!
    const {renderBuilder, get_children, onChange, settings} = this.props;
    const {config, store} = this.state;
    const {renderProvider: QueryWrapper} = settings;

    return (
      <QueryWrapper config={config}>
        <Provider store={store} context={context}>
          <ConnectedQuery
            config={config}
            getMemoizedTree={this.getMemoizedTree}
            onChange={onChange}
            renderBuilder={renderBuilder || get_children}
          />
        </Provider>
      </QueryWrapper>
    );
  }
}
