import React, { Component } from "react";
import merge from "lodash/merge";
import {connect} from "react-redux";
import context from "../stores/context";
import PropTypes from "prop-types";
import * as actions from "../actions";
import {immutableEqual} from "../utils/stuff";
import {useOnPropsChanged, liteShouldComponentUpdate, bindActionCreators} from "../utils/reactUtils";


class Query extends Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    onInit: PropTypes.func,
    renderBuilder: PropTypes.func,
    tree: PropTypes.any, //instanceOf(Immutable.Map)
    //dispatch: PropTypes.func.isRequired,
    //__lastAction
    //getMemoizedTree: PropTypes.func.isRequired,
    //getBasicConfig: PropTypes.func.isRequired,
    //sanitizeTree
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);

    this._updateActions(props);

    // For preventive validation (tree and config consistency)
    // When config has changed from QueryContainer, 
    //  but new dispatched validated tree value is not in redux store yet (tree prop is old)
    this.validatedTree = props.getMemoizedTree(props.config, props.tree, undefined, props.sanitizeTree);
    this.oldValidatedTree = this.validatedTree;

    const basicConfig = props.getBasicConfig(props.config);
    props.onInit && props.onInit(this.validatedTree, basicConfig, undefined, this.actions);
  }

  _updateActions (props) {
    const {config, dispatch} = props;
    this.actions = bindActionCreators({...actions.tree, ...actions.group, ...actions.rule}, config, dispatch);
  }

  shouldComponentUpdate = liteShouldComponentUpdate(this, {
    tree: (nextValue) => {
      if (nextValue === this.oldValidatedTree && this.oldValidatedTree === this.validatedTree) {
        // Got value dispatched from QueryContainer
        // Ignore, because we've just rendered it
        return false;
      }
      return true;
    }
  });

  onPropsChanged(nextProps) {
    const {onChange} = nextProps;
    const oldConfig = this.props.config;
    const newTree = nextProps.tree;
    const oldTree = this.props.tree;
    const newConfig = nextProps.config;

    this.oldValidatedTree = this.validatedTree;
    this.validatedTree = newTree;
    if (oldConfig !== newConfig) {
      this._updateActions(nextProps);
      this.validatedTree = nextProps.getMemoizedTree(newConfig, newTree, oldConfig);
    }

    const validatedTreeChanged = !immutableEqual(this.validatedTree, this.oldValidatedTree);
    if (validatedTreeChanged) {
      const newBasicConfig = nextProps.getBasicConfig(newConfig);
      onChange && onChange(this.validatedTree, newBasicConfig, nextProps.__lastAction, this.actions);
    }
  }

  render() {
    const {config, renderBuilder, dispatch} = this.props;
    const builderProps = {
      tree: this.validatedTree,
      actions: this.actions,
      config: config,
      dispatch: dispatch,
    };

    return renderBuilder(builderProps);
  }
}


const ConnectedQuery = connect(
  (state) => {
    return {
      tree: state.tree,
      __lastAction: state.__lastAction,
    };
  },
  null,
  null,
  {
    context
  }
)(Query);
ConnectedQuery.displayName = "ConnectedQuery";


export default ConnectedQuery;
