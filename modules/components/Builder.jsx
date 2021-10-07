import React, { Component } from "react";
import PropTypes from "prop-types";
import Immutable, {Map} from "immutable";
import { Item } from "./item/Item";
import SortableContainer from "./containers/SortableContainer";
import {getTotalReordableNodesCountInTree, getTotalRulesCountInTree} from "../utils/treeUtils";
import uuid from "../utils/uuid";
import {pureShouldComponentUpdate} from "../utils/reactUtils";


@SortableContainer
export default class Builder extends Component {
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
    this.path = Immutable.List.of(id);
  }

  render() {
    const reordableNodesCnt = getTotalReordableNodesCountInTree(this.props.tree);
    const totalRulesCnt = getTotalRulesCountInTree(this.props.tree);
    const id = this.props.tree.get("id");
    return (
      <Item 
        key={id}
        id={id}
        path={this.path}
        type={this.props.tree.get("type")}
        properties={this.props.tree.get("properties") || new Map()}
        config={this.props.config}
        actions={this.props.actions}
        children1={this.props.tree.get("children1") || new Map()}
        //tree={this.props.tree}
        reordableNodesCnt={reordableNodesCnt}
        totalRulesCnt={totalRulesCnt}
        onDragStart={this.props.onDragStart}
      />
    );
  }
}
