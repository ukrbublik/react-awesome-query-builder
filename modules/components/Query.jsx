import React, { PureComponent } from "react";
import {connect} from "react-redux";
import context from "../stores/context";
import PropTypes from "prop-types";
import * as actions from "../actions";
import {immutableEqual} from "../utils/stuff";
import {useOnPropsChanged, bindActionCreators} from "../utils/reactUtils";
import {validateAndFixTree} from "../utils/validation";


class Query extends PureComponent {
  static propTypes = {
    config: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    renderBuilder: PropTypes.func,
    tree: PropTypes.any, //instanceOf(Immutable.Map)
    //dispatch: PropTypes.func.isRequired,
    //__isInternalValueChange
    //__lastAction
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);

    this._updateActions(props);

    //tip: already validated with QueryContainer
    this.validatedTree = props.tree;

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
      onChange && onChange(this.validatedTree, newConfig, nextProps.__lastAction);
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
