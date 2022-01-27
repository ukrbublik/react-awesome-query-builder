import React from "react";
import PropTypes from "prop-types";
import GroupContainer from "../containers/GroupContainer";
import Draggable from "../containers/Draggable";
import {BasicGroup} from "./Group";
import {GroupActions} from "./GroupActions";
import {useOnPropsChanged} from "../../utils/reactUtils";
import {Col, dummyFn, ConfirmFn} from "../utils";
import Widget from "../rule/Widget";
const classNames = require("classnames");


@GroupContainer
@Draggable("group case_group")
@ConfirmFn
class CaseGroup extends BasicGroup {
  static propTypes = {
    ...BasicGroup.propTypes,
    // selectedField: PropTypes.string,
    // selectedOperator: PropTypes.string,
    // parentField: PropTypes.string,
    // setField: PropTypes.func,
    // setOperator: PropTypes.func,
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
    return this.props.parentReordableNodesCnt;
  }

  childrenClassName = () => "case_group--children";
  
  renderFooterWrapper = () => null;

  renderHeaderWrapper() {
    if (this.isDefaultCase())
      return null;
    return (
      <div key="group-header" className={classNames(
        "group--header", 
        this.isOneChild() ? "one--child" : "",
        this.showDragIcon() ? "with--drag" : "hide--drag",
        this.showConjs() && (!this.isOneChild() || this.showNot()) ? "with--conjs" : "hide--conjs"
      )}>
        {this.renderHeader()}
        {this.renderCaseTitle()}
        {this.renderActions()}
      </div>
    );
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

  renderHeader() {
    return (
      <div className={"group--conjunctions"}>
        {this.renderConjs()}
        {this.renderDrag()}
      </div>
    );
  }

  renderCaseTitle() {
    return null;
  }

  renderChildrenWrapper() {
    return (
      <div className={"case_group--body"}>
        {this.renderCondition()}
        {this.renderValue()}
      </div>
    );
  }

  renderCondition() {
    if (this.isDefaultCase()) {
      return (
        <div className={classNames(
          "group--children",
          this.childrenClassName()
        )}>
          {"default"}
        </div>
      );
    } else {
      return super.renderChildrenWrapper();
    }
  }

  renderActions() {
    if (this.isDefaultCase())
      return null;
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
    const { value } = this.props;
    const oneValue = value && value.size ? value.get(0) : null;
    const hasValue = oneValue != null && (Array.isArray(oneValue) ? oneValue.length > 0 : true);
    return super.isEmptyCurrentGroup() && !hasValue;
  }


  // extraPropsForItem(_item) {
  //   return {
  //     parentField: this.props.selectedField
  //   };
  // }
}


export default CaseGroup;
