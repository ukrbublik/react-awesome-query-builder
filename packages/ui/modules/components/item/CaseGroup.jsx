import React from "react";
import PropTypes from "prop-types";
import GroupContainer from "../containers/GroupContainer";
import Draggable from "../containers/Draggable";
import {BasicGroup} from "./Group";
import {GroupActions} from "./GroupActions";
import {useOnPropsChanged} from "../../utils/reactUtils";
import {Col, dummyFn, ConfirmFn} from "../utils";
import Widget from "../rule/Widget";
import classNames from "classnames";


class CaseGroup extends BasicGroup {
  static propTypes = {
    ...BasicGroup.propTypes,
    parentReordableNodesCnt: PropTypes.number,
    value: PropTypes.any,
    setValue: PropTypes.func,
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);
    this.onPropsChanged(props);
  }

  onPropsChanged(nextProps) {
  }

  isDefaultCase() {
    return this.props.children1 == undefined;
  }

  reordableNodesCnt() {
    // `parentReordableNodesCnt` is number of cases to reorder
    return this.props.parentReordableNodesCnt;
  }

  reordableNodesCntForItem(_item) {
    // `reordableNodesCnt` is number of nodes is current case
    if (this.props.isLocked)
      return 0;
    return this.props.reordableNodesCnt;
  }

  totalRulesCntForItem(_item) {
    // `totalRulesCnt` is number of nodes is current case
    return this.props.totalRulesCnt;
  }

  showDragIcon() {
    // default impl of `showDragIcon()` uses `this.reordableNodesCnt()`
    if (this.isDefaultCase())
      return false;
    return super.showDragIcon();
  }

  childrenClassName = () => "case_group--children";
  
  renderFooterWrapper = () => null;

  renderHeaderWrapper() {
    return (
      <div key="group-header" className={classNames(
        "group--header", 
        this.isOneChild() ? "one--child" : "",
        this.isOneChild() ? "hide--line" : "",
        this.isNoChildren() ? "no--children" : "",
        this.showDragIcon() ? "with--drag" : "hide--drag",
        this.showConjs() && (!this.isOneChild() || this.showNot()) ? "with--conjs" : "hide--conjs"
      )}>
        {this.renderHeaderLeft()}
        {this.renderHeaderCenter()}
        {this.renderActions()}
      </div>
    );
  }

  renderChildrenWrapper() {
    if (this.isDefaultCase())
      return null;
    // body has 2 columns: condition & value
    return (
      <div className={"case_group--body"}>
        {this.renderCondition()}
        {this.renderValue()}
      </div>
    );
  }

  renderHeaderLeft() {
    if (this.isDefaultCase()) {
      const { defaultCaseLabel } = this.props.config.settings;
      return defaultCaseLabel || "";
    }
    // default impl:
    return (
      <div className={"group--conjunctions"}>
        {this.renderConjs()}
        {this.renderDrag()}
      </div>
    );
  }

  renderCondition() {
    if (this.isDefaultCase())
      return null;
    return super.renderChildrenWrapper();
  }

  renderHeaderCenter() {
    if (this.isDefaultCase())
      return this.renderValue();
    else
      return null;
  }

  canAddGroup() {
    if (this.isDefaultCase())
      return false;
    return super.canAddGroup();
  }

  canAddRule() {
    if (this.isDefaultCase())
      return false;
    return super.canAddRule();
  }

  renderValue() {
    const { config, isLocked, value, setValue, id } = this.props;
    const { immutableValuesMode } = config.settings;

    const widget = <Widget
      key="values"
      isCaseValue={true}
      field={"!case_value"}
      operator={null}
      value={value}
      valueSrc={"value"}
      valueError={null}
      config={config}
      setValue={!immutableValuesMode ? setValue : dummyFn}
      setValueSrc={dummyFn}
      readonly={immutableValuesMode || isLocked}
      id={id}
      groupId={null}
    />;

    return (
      <Col className="case_group--value">
        {widget}
      </Col>
    );
  }

  renderActions() {
    const {config, addGroup, addRule, isLocked, isTrueLocked, id} = this.props;
    return <GroupActions
      config={config}
      addGroup={addGroup}
      addRule={addRule}
      canAddRule={this.canAddRule()}
      canAddGroup={this.canAddGroup()}
      canDeleteGroup={this.canDeleteGroup()}
      removeSelf={this.removeSelf}
      setLock={this.setLock}
      isLocked={isLocked}
      isTrueLocked={isTrueLocked}
      id={id}
    />;
  }

  isEmptyCurrentGroup() {
    // used to confirm self-deletion
    const { value } = this.props;
    const oneValue = value && value.size ? value.get(0) : null;
    const hasValue = oneValue != null && (Array.isArray(oneValue) ? oneValue.length > 0 : true);
    return super.isEmptyCurrentGroup() && !hasValue;
  }

}

export default GroupContainer(Draggable("group case_group")(ConfirmFn(CaseGroup)));

