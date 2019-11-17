import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Immutable, {Map} from 'immutable';
import Item from '../components/Item';
import SortableContainer from './containers/SortableContainer';
import {getTotalNodesCountInTree} from "../utils/treeUtils";
import uuid from "../utils/uuid";
import PureRenderMixin from 'react-addons-pure-render-mixin';


@SortableContainer
export default class Builder extends Component {
  static propTypes = {
    tree: PropTypes.any.isRequired, //instanceOf(Immutable.Map)
    config: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    onDragStart: PropTypes.func,
  };

  pureShouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  shouldComponentUpdate = this.pureShouldComponentUpdate;

  constructor(props) {
    super(props);

    this._updPath(props);
  }

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
        properties={this.props.tree.get('properties') || new Map()}
        config={this.props.config}
        actions={this.props.actions}
        children1={this.props.tree.get('children1') || new Map()}
        //tree={this.props.tree}
        treeNodesCnt={treeNodesCnt}
        onDragStart={this.props.onDragStart}
      >
      </Item>
    );
  }
}
