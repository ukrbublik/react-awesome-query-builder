import React from 'react';
import PropTypes from 'prop-types';
import GroupContainer from './containers/GroupContainer';
import Draggable from './containers/Draggable';
import {Group} from './Group';


@GroupContainer
@Draggable("group rule_group")
class RuleGroup extends Group {
  static propTypes = {
    ...Group.propTypes,
    selectedField: PropTypes.string, // for RuleGroup
  };

  childrenClassName = () => 'rule_group--children';
  
  renderHeaderWrapper = () => null;
  renderFooterWrapper = () => null;
  renderConjs = () => null;
  canAddGroup = () => false;

  reordableNodesCnt() {
    const {children1} = this.props;
    return children1.size;
  }

  renderChildrenWrapper() {
    return (
      <div>
        {this.renderDrag()}
        {this.renderActions()}
        {super.renderChildrenWrapper()}
      </div>
    );
  };
}


export default RuleGroup;
