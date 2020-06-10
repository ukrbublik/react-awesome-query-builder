import React, { Component, PureComponent } from "react";
import PropTypes from "prop-types";
import createTreeStore from "../stores/tree";
import {createStore} from "redux";
import {Provider, Connector, connect} from "react-redux";
import * as actions from "../actions";
import {extendConfig} from "../utils/configUtils";
import {fixPathsInTree} from "../utils/treeUtils";
import {bindActionCreators, shallowEqual, immutableEqual, useOnPropsChanged} from "../utils/stuff";
import {validateTree} from "../utils/validation";
import {defaultRoot} from "../utils/defaultUtils";
import {liteShouldComponentUpdate} from "../utils/renderUtils";
import pick from "lodash/pick";


const configKeys = ["conjunctions", "fields", "types", "operators", "widgets", "settings", "funcs"];

const validateAndFixTree = (newTree, _oldTree, newConfig, oldConfig) => {
  let tree = validateTree(newTree, _oldTree, newConfig, oldConfig, true, true);
  tree = fixPathsInTree(tree);
  return tree;
};


class Query extends PureComponent {
    static propTypes = {
      config: PropTypes.object.isRequired,
      onChange: PropTypes.func,
      renderBuilder: PropTypes.func,
      tree: PropTypes.any, //instanceOf(Immutable.Map)
      //dispatch: PropTypes.func.isRequired,
    };

    constructor(props) {
      super(props);
      useOnPropsChanged(this);

      this._updateActions(props);

      this.validatedTree = this.validateTree(props, props);
      //props.onChange && props.onChange(this.validatedTree, props.config);
    }

    validateTree (props, oldProps) {
      return validateAndFixTree(props.tree, oldProps.tree, props.config, oldProps.config);
    }

    _updateActions (props) {
      const {config, dispatch} = props;
      this.actions = bindActionCreators({...actions.tree, ...actions.group, ...actions.rule}, config, dispatch);
    }

    onPropsChanged(nextProps) {
      const {onChange} = nextProps;
      const oldConfig = this.props.config;
      const newTree = nextProps.tree;
      const newConfig = nextProps.config;
      const oldValidatedTree = this.validatedTree;

      this.validatedTree = newTree;
      if (oldConfig !== newConfig) {
        this._updateActions(nextProps);
        this.validatedTree = this.validateTree(nextProps, this.props);
      }

      const validatedTreeChanged = !immutableEqual(this.validatedTree, oldValidatedTree);
      if (validatedTreeChanged) {
        onChange && onChange(this.validatedTree, newConfig);
      }
    }

    render() {
      const {config, renderBuilder, dispatch, __isInternalValueChange} = this.props;
      const builderProps = {
        tree: this.validatedTree,
        actions: this.actions,
        config: config,
        dispatch: dispatch,
        __isInternalValueChange
      };

      return renderBuilder(builderProps);
    }
}

const ConnectedQuery = connect(
  (state) => {
    return {
      tree: state.tree,
      __isInternalValueChange: state.__isInternalValueChange,
    };
  },
)(Query);
ConnectedQuery.displayName = "ConnectedQuery";


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

      const config = pick(props, configKeys);
      const extendedConfig = extendConfig(config);
      const tree = props.value;
      const validatedTree = tree ? validateAndFixTree(tree, null, config, config) : null;

      const store = createTreeStore({...config, tree: validatedTree});

      this.state = {
        store: createStore(store),
        config: extendedConfig,
      };
    }

    shouldComponentUpdate = liteShouldComponentUpdate(this, {
      value: (nextValue, prevValue, state) => {
        const storeValue = state.store.getState().tree;
        return !immutableEqual(storeValue, nextValue) && !immutableEqual(prevValue, nextValue);
      }
    });

    onPropsChanged(nextProps) {
      if (this.props.dontDispatchOnNewProps)
        return;
        
      // compare configs
      const oldConfig = pick(this.props, configKeys);
      let nextConfig = pick(nextProps, configKeys);
      const isConfigChanged = !shallowEqual(oldConfig, nextConfig, true);
      if (isConfigChanged) {
        nextConfig = extendConfig(nextConfig);
        this.setState({config: nextConfig});
      }
        
      // compare trees
      const storeValue = this.state.store.getState().tree;
      const isTreeChanged = !immutableEqual(nextProps.value, this.props.value) && !immutableEqual(nextProps.value, storeValue);
      if (isTreeChanged) {
        const nextTree = nextProps.value || defaultRoot({ ...nextProps, tree: null });
        const validatedTree = validateAndFixTree(nextTree, null, nextConfig, oldConfig);
        this.state.store.dispatch(
          actions.tree.setTree(nextProps, validatedTree)
        );
      }
    }

    render() {
      // `get_children` is deprecated!
      const {renderBuilder, get_children, onChange, settings} = this.props;
      const {config, store} = this.state;
      const {renderProvider: QueryWrapper} = settings;

      return (
        <QueryWrapper config={config}>
          <Provider store={store}>
            <ConnectedQuery
              store={store}
              config={config}
              onChange={onChange}
              renderBuilder={renderBuilder || get_children}
            />
          </Provider>
        </QueryWrapper>
      );
    }
}
