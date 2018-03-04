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
    onDragStart: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this._updPath(props);
  }

  // componentWillReceiveProps (props) {
  //   let prevProps = this.props;
  //   this._updPath(props);
  // }

  _updPath (props) {
    const id = props.tree.get('id');
    this.path = Immutable.List.of(id);
  }

  render() {
    const treeNodesCnt = getTotalNodesCountInTree(this.props.tree);
    const id = this.props.tree.get('id');
    return (
      <Item 
        key={id}
        id={id}
        path={this.path}
        type={this.props.tree.get('type')}
        properties={this.props.tree.get('properties')}
        config={this.props.config}
        actions={this.props.actions}
        children1={this.props.tree.get('children1')}
        //tree={this.props.tree}
        treeNodesCnt={treeNodesCnt}
        onDragStart={this.props.onDragStart}
      >
      </Item>
    );
  }
}
