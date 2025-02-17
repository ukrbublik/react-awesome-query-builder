import React from "react";
import { Utils } from "@react-awesome-query-builder/core";
import PropTypes from "prop-types";
import GroupContainer from "../containers/GroupContainer";
import Draggable from "../containers/Draggable";
import {BasicGroup} from "./Group";
import {RuleGroupExtActions} from "./RuleGroupExtActions";
import FieldWrapper from "../rule/FieldWrapper";
import OperatorWrapper from "../rule/OperatorWrapper";
import {useOnPropsChanged} from "../../utils/reactUtils";
import {Col, dummyFn, WithConfirmFn} from "../utils";
import Widget from "../rule/Widget";
import classNames from "classnames";
const {getFieldConfig, getFieldWidgetConfig} = Utils.ConfigUtils;
const {isEmptyRuleGroupExtPropertiesAndChildren} = Utils.RuleUtils;
const {getTotalReordableNodesCountInTree} = Utils.TreeUtils;


class RuleGroupExt extends BasicGroup {
  static propTypes = {
    ...BasicGroup.propTypes,
    selectedField: PropTypes.any,
    selectedFieldSrc: PropTypes.string,
    selectedOperator: PropTypes.string,
    value: PropTypes.any,
    parentField: PropTypes.string,
    setField: PropTypes.func,
    setFieldSrc: PropTypes.func,
    setOperator: PropTypes.func,
    setValue: PropTypes.func,
    valueError: PropTypes.any,
    lev: PropTypes.number, // from GroupContainer
  };

  constructor(props) {
    super(props);
  }

  onPropsChanged(nextProps) {
    super.onPropsChanged(nextProps);
  }

  childrenClassName = () => "rule_group_ext--children";
  
  renderFooterWrapper = () => null;

  canAddGroup() {
    return this.props.allowFurtherNesting;
  }

  canAddRule() {
    const {config, selectedField} = this.props;
    const selectedFieldConfig = getFieldConfig(config, selectedField);
    const maxNumberOfRules = selectedFieldConfig?.maxNumberOfRules;
    const totalRulesCnt = this.props.totalRulesCnt;
    if (maxNumberOfRules) {
      return totalRulesCnt < maxNumberOfRules;
    }
    return true;
  }

  canDeleteGroup = () => true;

  renderHeaderWrapper() {
    return (
      <>
        {this.renderGroupField()}
        {this.renderError()}
        {this.renderGroupHeader()}
      </>
    );
  }

  canRenderHeader() {
    return this.canRenderConjs();
  }

  renderHeader() {
    return (
      <div className={"group--conjunctions"}>
        {this.renderConjs()}
      </div>
    );
  }

  renderGroupField() {
    return (
      <div className={classNames(
        "group--field--count--rule",
        this.showDragIcon() ? "with--drag" : "hide--drag",
      )}>
        {this.renderDrag()}
        {this.renderField()}
        {this.renderOperator()}
        {this.renderWidget()}
        {/* {!this.isNoChildren() ? " where:" : ""} */}
        {this.renderSelfActions()}
      </div>
    );
  }

  canRenderGroupHeader() {
    return this.canRenderHeader() && this.canRenderChildrenActions();
  }

  renderGroupHeader() {
    if (!this.canRenderGroupHeader()) {
      return null;
    }
    return (
      <div className={classNames(
        "group--header", 
        this.isOneChild() ? "one--child" : "",
        this.isOneChild() ? "hide--line" : "",
        this.isNoChildren() ? "no--children" : "",
        this.showConjs() ? "with--conjs" : "hide--conjs"
      )}>
        {this.renderHeader()}
        {this.renderChildrenActions()}
      </div>
    );
  }

  renderError() {
    const {config, valueError} = this.props;
    const { renderRuleError, showErrorMessage } = config.settings;
    const oneError = [...(valueError?.toArray() || [])].filter(e => !!e).shift() || null;
    return showErrorMessage && oneError 
        && <div className="rule_group--error">
          {renderRuleError ? renderRuleError({error: oneError}, config.ctx) : oneError}
        </div>;
  }

  showNot() {
    const {config, selectedField} = this.props;
    const selectedFieldConfig = getFieldConfig(config, selectedField);
    return selectedFieldConfig?.showNot ?? config.settings.showNot;
  }

  conjunctionOptions() {
    const { selectedField } = this.props;
    return this.conjunctionOptionsForGroupField(selectedField);
  }

  renderField() {
    const {
      config, selectedField, selectedFieldSrc, selectedFieldType, setField, setFieldSrc, setFuncValue,
      parentField, id, groupId, isLocked
    } = this.props;
    const { immutableFieldsMode } = config.settings;
    
    return <FieldWrapper
      key="field"
      classname={"rule--field"}
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

  renderOperator() {
    const {config, selectedField, selectedFieldSrc, selectedOperator, setField, setOperator, isLocked} = this.props;
    const { immutableFieldsMode } = config.settings;
    const selectedFieldWidgetConfig = getFieldWidgetConfig(config, selectedField, selectedOperator) || {};
    const hideOperator = selectedFieldWidgetConfig.hideOperator;
    const showOperatorLabel = selectedField && hideOperator && selectedFieldWidgetConfig.operatorInlineLabel;
    const showOperator = selectedField && !hideOperator;

    return <OperatorWrapper
      key="operator"
      classname={"group--operator"}
      config={config}
      selectedField={selectedField}
      selectedFieldSrc={selectedFieldSrc}
      selectedOperator={selectedOperator}
      setOperator={setOperator}
      showOperator={showOperator}
      showOperatorLabel={showOperatorLabel}
      selectedFieldWidgetConfig={selectedFieldWidgetConfig}
      readonly={immutableFieldsMode || isLocked}
      id={this.props.id}
      groupId={this.props.groupId}
    />;
  }

  isEmptyCurrentGroup() {
    const {children1, config} = this.props;
    const ruleData = this._buildWidgetProps(this.props);
    return isEmptyRuleGroupExtPropertiesAndChildren(ruleData, children1, config);
  }

  _buildWidgetProps({
    selectedField, selectedFieldSrc, selectedFieldType,
    selectedOperator, operatorOptions,
    value, valueType, valueSrc, asyncListValues, valueError, fieldError,
    parentField,
  }) {
    return {
      field: selectedField,
      fieldSrc: selectedFieldSrc,
      fieldType: selectedFieldType,
      operator: selectedOperator,
      operatorOptions,
      value,
      valueType, // new Immutable.List(["number"])
      // todo: aggregation can be not only number?
      valueSrc: ["value"], //new Immutable.List(["value"]), // should be fixed in isEmptyRuleGroupExtPropertiesAndChildren
      //asyncListValues,
      valueError,
      fieldError: null,
      parentField,
    };
  }

  renderWidget() {
    const {config, selectedField, selectedOperator, isLocked} = this.props;
    const { immutableValuesMode } = config.settings;
    const isFieldAndOpSelected = selectedField && selectedOperator;
    const showWidget = isFieldAndOpSelected;
    if (!showWidget) return null;

    const widget = <Widget
      key="values"
      isForRuleGroup={true}
      {...this._buildWidgetProps(this.props)}
      config={config}
      setValue={!immutableValuesMode ? this.props.setValue : dummyFn}
      // todo: aggregation can be not only number?
      setValueSrc={dummyFn}
      readonly={immutableValuesMode || isLocked}
      id={this.props.id}
      groupId={this.props.groupId}
    />;

    return (
      <Col key={"widget-for-"+this.props.selectedOperator} className="rule--value">
        {widget}
      </Col>
    );
  }

  showChildrenActionsAsSelf() {
    const { config } = this.props;
    const { forceShowConj } = config.settings;
    return this.isNoChildren() || this.isOneChild() && !forceShowConj && !this.showNot();
  }

  canRenderChildrenActions() {
    return !this.showChildrenActionsAsSelf() && (this.canAddRule() || this.canAddGroup());
  }

  childrenAreRequired() {
    const {config, selectedOperator} = this.props;
    const cardinality = config.operators[selectedOperator]?.cardinality ?? 1;
    return cardinality == 0; // tip: for group operators some/none/all
  }

  renderChildrenActions() {
    const {config, addRule, addGroup, isLocked, isTrueLocked, id} = this.props;

    return <RuleGroupExtActions
      config={config}
      addRule={addRule}
      addGroup={addGroup}
      canAddRule={!this.showChildrenActionsAsSelf() && this.canAddRule()}
      canAddGroup={!this.showChildrenActionsAsSelf() && this.canAddGroup()}
      removeSelf={this.removeGroupChildren}
      canDeleteGroup={true}
      isLocked={isLocked}
      isTrueLocked={isTrueLocked}
      id={id+"_children"}
    />;
  }

  renderSelfActions() {
    const {config, addRule, addGroup, isLocked, isTrueLocked, id} = this.props;

    return <RuleGroupExtActions
      config={config}
      addRule={addRule}
      addGroup={addGroup}
      canAddRule={this.showChildrenActionsAsSelf() && this.canAddRule()}
      canAddGroup={this.showChildrenActionsAsSelf() && this.canAddGroup()}
      removeSelf={this.removeSelf}
      setLock={this.setLock}
      isLocked={isLocked}
      isTrueLocked={isTrueLocked}
      canDeleteGroup={this.canDeleteGroup()}
      id={id+"_self"}
    />;
  }


  reordableNodesCntForItem(_item) {
    if (this.props.isLocked)
      return 0;
    const {children1, id} = this.props;
    return getTotalReordableNodesCountInTree({
      id, type: "rule_group", children1
    });
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


export default GroupContainer(Draggable("group rule_group_ext")(WithConfirmFn(RuleGroupExt)), "rule_group");

