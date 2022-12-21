import { Utils } from "@react-awesome-query-builder/core";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Item } from "./item/Item";
import SortableContainer from "./containers/SortableContainer";
import {pureShouldComponentUpdate} from "../utils/reactUtils";
const { getTotalReordableNodesCountInTree, getTotalRulesCountInTree } = Utils.TreeUtils;
const { createListFromArray, emptyProperies } = Utils.DefaultUtils;

class Builder extends Component {
  static propTypes = {
    tree: PropTypes.any.isRequired, //instanceOf(Immutable.Map)
    config: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    onDragStart: PropTypes.func,
  };

  shouldComponentUpdate(nextProps, nextState) {
    const prevProps = this.props;
    let should = pureShouldComponentUpdate(this)(nextProps, nextState);
    if (should) {
      let chs = [];
      for (let k in nextProps) {
        let changed = (nextProps[k] !== prevProps[k]);
        if (changed && k != "__isInternalValueChange") {
          chs.push(k);
        }
      }
      if (!chs.length)
        should = false;
      //optimize render
      if (chs.length == 1 && chs[0] == "tree" && nextProps.__isInternalValueChange)
        should = false;
    }
    return should;
  }

  constructor(props) {
    super(props);

    this._updPath(props);
  }

  _updPath (props) {
    const id = props.tree.get("id");
    this.path = createListFromArray([id]);
  }

  render() {
    const tree = this.props.tree;
    const rootType = tree.get("type");
    const isTernary = rootType == "switch_group";
    const reordableNodesCnt = isTernary ? null : getTotalReordableNodesCountInTree(tree);
    const totalRulesCnt = isTernary ? null : getTotalRulesCountInTree(tree);
    const id = tree.get("id");
    return (
      <Item 
        key={id}
        id={id}
        path={this.path}
        type={rootType}
        properties={tree.get("properties") || emptyProperies()}
        config={this.props.config}
        actions={this.props.actions}
        children1={tree.get("children1") || emptyProperies()}
        //tree={tree}
        reordableNodesCnt={reordableNodesCnt}
        totalRulesCnt={totalRulesCnt}
        parentReordableNodesCnt={0}
        onDragStart={this.props.onDragStart}
      />
    );
  }
}

export default SortableContainer(Builder);
