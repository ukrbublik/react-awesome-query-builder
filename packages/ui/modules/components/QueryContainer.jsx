import React, { Component, PureComponent } from "react";
import { Utils } from "@react-awesome-query-builder/core";
import PropTypes from "prop-types";
import treeStoreReducer from "../stores/tree";
import context from "../stores/context";
import {createStore} from "redux";
import {Provider} from "react-redux";
import * as actions from "../actions";
import {immutableEqual} from "../utils/stuff";
import {createValidationMemo} from "../utils/validationMemo";
import {liteShouldComponentUpdate, useOnPropsChanged} from "../utils/reactUtils";
import ConnectedQuery from "./Query";
const {defaultRoot} = Utils.DefaultUtils;
const {createConfigMemo} = Utils.ConfigUtils;


export default class QueryContainer extends Component {
  static propTypes = {
    //config
    conjunctions: PropTypes.object.isRequired,
    fields: PropTypes.object.isRequired,
    types: PropTypes.object.isRequired,
    operators: PropTypes.object.isRequired,
    widgets: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
    ctx: PropTypes.object.isRequired,

    onChange: PropTypes.func,
    onInit: PropTypes.func,
    renderBuilder: PropTypes.func,
    value: PropTypes.any, //instanceOf(Immutable.Map)
  };

  constructor(props, context) {
    super(props, context);
    useOnPropsChanged(this);

    const { getExtendedConfig, getBasicConfig, clearConfigMemo } = createConfigMemo({
      reactIndex: this._reactInternals?.index ?? -1,
      maxSize: 2, // current and prev
    });
    this.getMemoizedConfig = getExtendedConfig;
    this.getBasicConfig = getBasicConfig;
    this.clearConfigMemo = clearConfigMemo;
    this.getMemoizedTree = createValidationMemo();
    
    const config = this.getMemoizedConfig(props);
    const {shouldCreateEmptyGroup} = config.settings;
    const canAddDefaultRule = !shouldCreateEmptyGroup; // if prop `value` is not provided, can add default/empty rule?
    const emptyTree = defaultRoot(config, canAddDefaultRule);
    const sanitizeTree = !!props.value;
    const tree = props.value || emptyTree;
    const validatedTree = this.getMemoizedTree(config, tree, undefined, sanitizeTree);

    const reducer = treeStoreReducer(config, validatedTree, this.getMemoizedTree, this.setLastTree, this.getConfig);
    const store = createStore(reducer);

    this.config = config;
    this.state = {
      store
    };
    this.QueryWrapper = (pr) => config.settings.renderProvider(pr, config.ctx);
  }

  componentWillUnmount() {
    this.clearConfigMemo();
  }

  setLastTree = (lastTree) => {
    if (this.prevTree) {
      this.prevprevTree = this.prevTree;
    }
    this.prevTree = lastTree;
  };

  getConfig = () => {
    return this.config;
  };

  shouldComponentUpdate = liteShouldComponentUpdate(this, {
    value: (nextValue, prevValue, state) => { return false; }
  });

  onPropsChanged(nextProps) {
    // compare configs
    const prevProps = this.props;
    const oldConfig = this.config;
    const nextConfig = this.getMemoizedConfig(nextProps);
    const isConfigChanged = oldConfig !== nextConfig;

    // compare trees
    const storeValue = this.state.store.getState().tree;
    const isTreeChanged = !immutableEqual(nextProps.value, this.props.value) && !immutableEqual(nextProps.value, storeValue);
    const currentTree = isTreeChanged ? (nextProps.value || defaultRoot(nextProps)) : storeValue;
    const isTreeTrulyChanged = isTreeChanged && !immutableEqual(nextProps.value, this.prevTree) && !immutableEqual(nextProps.value, this.prevprevTree);
    this.sanitizeTree = isTreeTrulyChanged || isConfigChanged;

    if (isConfigChanged) {
      if (prevProps.settings.renderProvider !== nextProps.settings.renderProvider) {
        this.QueryWrapper = (props) => nextConfig.settings.renderProvider(props, nextConfig.ctx);
      }
      this.config = nextConfig;
    }
    
    if (isTreeChanged || isConfigChanged) {
      const validatedTree = this.getMemoizedTree(nextConfig, currentTree, oldConfig, this.sanitizeTree);
      //return Promise.resolve().then(() => {
      this.state.store.dispatch(
        actions.tree.setTree(nextConfig, validatedTree)
      );
      //});
    }
  }

  render() {
    // `get_children` is deprecated!
    const {renderBuilder, get_children, onChange, onInit} = this.props;
    const {store} = this.state;
    const config = this.config;
    const QueryWrapper = this.QueryWrapper;

    return (
      <QueryWrapper config={config}>
        <Provider store={store} context={context}>
          <ConnectedQuery
            config={config}
            getMemoizedTree={this.getMemoizedTree}
            getBasicConfig={this.getBasicConfig}
            sanitizeTree={this.sanitizeTree}
            onChange={onChange}
            onInit={onInit}
            renderBuilder={renderBuilder || get_children}
          />
        </Provider>
      </QueryWrapper>
    );
  }
}
