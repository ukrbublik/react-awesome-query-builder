import React from "react";
import PropTypes from "prop-types";
import GroupContainer from "./containers/GroupContainer";
import Draggable from "./containers/Draggable";
import {Group} from "./Group";
import {RuleGroupActions} from "./RuleGroupActions";
import {FieldWrapper} from "./Rule";
import {useOnPropsChanged} from "../utils/stuff";


@GroupContainer
@Draggable("group rule_group")
class RuleGroup extends Group {
  static propTypes = {
    ...Group.propTypes,
    selectedField: PropTypes.string,
    parentField: PropTypes.string,
    setField: PropTypes.func,
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);
    this.onPropsChanged(props);
  }

  onPropsChanged(nextProps) {
  }

  childrenClassName = () => "rule_group--children";
  
  renderHeaderWrapper = () => null;
  renderFooterWrapper = () => null;
  renderConjs = () => null;
  canAddGroup = () => false;
  canAddRule = () => true;
  canDeleteGroup = () => false;

  reordableNodesCnt() {
    const {children1} = this.props;
    return children1.size;
  }

  renderChildrenWrapper() {
    return (
      <>
        {this.renderDrag()}
        {this.renderField()}
        {this.renderActions()}
        {super.renderChildrenWrapper()}
      </>
    );
  }

  renderField() {
    const { immutableFieldsMode } = this.props.config.settings;
    return <FieldWrapper
      key="field"
      classname={"group--field"}
      config={this.props.config}
      selectedField={this.props.selectedField}
      setField={this.props.setField}
      parentField={this.props.parentField}
      readonly={immutableFieldsMode}
    />;
  }

  renderActions() {
    const {config, addRule} = this.props;

    return <RuleGroupActions
      config={config}
      addRule={addRule}
      canAddRule={this.canAddRule()}
      canDeleteGroup={this.canDeleteGroup()}
      removeSelf={this.removeSelf}
    />;
  }

  extraPropsForItem(_item) {
    return {
      parentField: this.props.selectedField
    };
  }
}


export default RuleGroup;
