import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import Item from '../components/Item';
import SortableContainer from './containers/SortableContainer';
import {getTotalNodesCountInTree} from "../utils/treeUtils";


@SortableContainer
export default class Builder extends Component {
  static propTypes = {
    tree: PropTypes.instanceOf(Immutable.Map).isRequired,
    config: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    //dispatch: PropTypes.func.isRequired,
    onDragStart: PropTypes.func,
    dragging: PropTypes.object, //{id, x, y, w, h}
  };

  render() {
    const treeNodesCnt = getTotalNodesCountInTree(this.props.tree);
    const id = this.props.tree.get('id');
    return (
      <Item key={id}
        id={id}
        path={Immutable.List.of(id)}
        type={this.props.tree.get('type')}
        properties={this.props.tree.get('properties')}
        config={this.props.config}
        actions={this.props.actions}
        dispatch={this.props.dispatch}
        children1={this.props.tree.get('children1')}
        tree={this.props.tree}
        treeNodesCnt={treeNodesCnt}
        onDragStart={this.props.onDragStart}
        dragging={this.props.dragging}
      >
      </Item>
    );
  }
}
