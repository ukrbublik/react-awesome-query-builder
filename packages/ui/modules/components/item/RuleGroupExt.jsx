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
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);
    this.onPropsChanged(props);
  }

  onPropsChanged(nextProps) {
  }

  childrenClassName = () => "rule_group_ext--children";
  
  renderFooterWrapper = () => null;
  canAddGroup = () => false;
  canAddRule = () => true;
  canDeleteGroup = () => true;

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
        {this.renderHeader()}
        {this.renderGroupField()}
        {this.renderActions()}
      </div>
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

  renderGroupField() {
    return (
      <div className={"group--field--count--rule"}>
        {this.renderField()}
        {this.renderOperator()}
        {this.renderWidget()}
        {this.renderError()}
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
    const {config, selectedField, selectedOperator} = this.props;
    const selectedFieldConfig = getFieldConfig(config, selectedField) || {};
    return selectedFieldConfig.showNot != undefined ? selectedFieldConfig.showNot : config.settings.showNot;
  }

  conjunctionOptions() {
    const {config, selectedField, selectedOperator} = this.props;
    const selectedFieldConfig = getFieldConfig(config, selectedField) || {};
    let conjunctionOptions = super.conjunctionOptions();
    if (selectedFieldConfig.conjunctions) {
      let filtered = {};
      for (let k of selectedFieldConfig.conjunctions) {
        const options = conjunctionOptions[k];
        if (options) {
          filtered[k] = options;
        }
      }
      conjunctionOptions = filtered;
    }
    return conjunctionOptions;
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
      selectedFieldPartsLabels={["group"]}
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

  renderActions() {
    const {config, addRule, isLocked, isTrueLocked, id} = this.props;

    return <RuleGroupExtActions
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

  reordableNodesCntForItem(_item) {
    if (this.props.isLocked)
      return 0;
    const {children1} = this.props;
    return children1?.size || 0;
  }

  extraPropsForItem(_item) {
    return {
      parentField: this.props.selectedField
    };
  }
}


export default GroupContainer(Draggable("group rule_group_ext")(WithConfirmFn(RuleGroupExt)), "rule_group");

