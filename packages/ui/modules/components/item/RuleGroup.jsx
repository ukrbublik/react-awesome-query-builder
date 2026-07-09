import React from "react";
import { Utils } from "@react-awesome-query-builder/core";
import PropTypes from "prop-types";
import GroupContainer from "../containers/GroupContainer";
import Draggable from "../containers/Draggable";
import {BasicGroup} from "./Group";
import {RuleGroupActions} from "./RuleGroupActions";
import FieldWrapper from "../rule/FieldWrapper";
import {WithConfirmFn} from "../utils";
const {getFieldConfig} = Utils.ConfigUtils;


class RuleGroup extends BasicGroup {
  static propTypes = {
    ...BasicGroup.propTypes,
    selectedField: PropTypes.any,
    selectedFieldSrc: PropTypes.string,
    parentField: PropTypes.string,
    setField: PropTypes.func,
    setFieldSrc: PropTypes.func,
    lev: PropTypes.number, // from GroupContainer
  };

  constructor(props) {
    super(props);
  }

  onPropsChanged(nextProps) {
    super.onPropsChanged(nextProps);
  }

  childrenClassName = () => "rule_group--children";
  
  renderHeaderWrapper = () => null;
  renderFooterWrapper = () => null;
  renderConjs = () => null;
  canAddGroup = () => false;
  canAddRule = () => true;
  canDeleteGroup = () => false;

  reordableNodesCntForItem(_item) {
    if (this.props.isLocked)
      return 0;
    const {children1} = this.props;
    return children1?.size || 0;
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
    const {
      config, selectedField, selectedFieldSrc, selectedFieldType, setField, setFuncValue, setFieldSrc, 
      parentField, id, groupId, isLocked
    } = this.props;
    const { immutableFieldsMode } = config.settings;
    
    return <FieldWrapper
      key="field"
      classname={"group--field"}
      config={config}
      canSelectFieldSource={false}
      selectedField={selectedField}
      selectedFieldSrc={selectedFieldSrc}
      selectedFieldType={selectedFieldType}
      setField={setField}
      setFuncValue={setFuncValue}
      setFieldSrc={setFieldSrc}
      parentField={parentField}
      readonly={immutableFieldsMode || isLocked}
      id={id}
      groupId={groupId}
    />;
  }

  renderActions() {
    const {config, addRule, isLocked, isTrueLocked, id} = this.props;

    return <RuleGroupActions
      config={config}
      addRule={addRule}
      canAddRule={this.canAddRule()}
      canDeleteGroup={this.canDeleteGroup()}
      removeSelf={this.removeSelf}
      setLock={this.setLock}
      isLocked={isLocked}
      isTrueLocked={isTrueLocked}
      id={id}
    />;
  }

  extraPropsForItem(_item) {
    const { selectedField, lev, config } = this.props;
    const selectedFieldConfig = getFieldConfig(config, selectedField);
    return {
      parentField: selectedField,
      parentFieldPathSize: lev + 1,
      parentFieldCanReorder: selectedFieldConfig?.canReorder ?? config.settings.canReorder,
    };
  }
}


export default GroupContainer(Draggable("group rule_group")(WithConfirmFn(RuleGroup)), "rule_group");
