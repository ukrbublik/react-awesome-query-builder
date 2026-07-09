import React, { Component } from "react";
import { Utils } from "@react-awesome-query-builder/core";
import PropTypes from "prop-types";
import RuleContainer from "../containers/RuleContainer";
import Draggable from "../containers/Draggable";
import OperatorWrapper from "../rule/OperatorWrapper";
import FieldWrapper from "../rule/FieldWrapper";
import Widget from "../rule/Widget";
import OperatorOptions from "../rule/OperatorOptions";
import {useOnPropsChanged} from "../../utils/reactUtils";
import {Col, dummyFn, WithConfirmFn, getRenderFromConfig} from "../utils";
import classNames from "classnames";
const {getFieldConfig, getOperatorConfig, getFieldWidgetConfig, getFieldId} = Utils.ConfigUtils;
const {isEmptyRuleProperties} = Utils.RuleUtils;


class Rule extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    groupId: PropTypes.string,
    selectedField: PropTypes.any,
    selectedFieldSrc: PropTypes.string,
    selectedFieldType: PropTypes.string,
    selectedOperator: PropTypes.string,
    operatorOptions: PropTypes.object,
    config: PropTypes.object.isRequired,
    value: PropTypes.any, //depends on widget
    valueSrc: PropTypes.any,
    valueType: PropTypes.any,
    asyncListValues: PropTypes.array,
    isDraggingMe: PropTypes.bool,
    isDraggingTempo: PropTypes.bool,
    parentField: PropTypes.string, //from RuleGroup
    valueError: PropTypes.any,
    fieldError: PropTypes.string,
    isLocked: PropTypes.bool,
    isTrueLocked: PropTypes.bool,
    //path: PropTypes.instanceOf(Immutable.List),
    //actions
    handleDraggerMouseDown: PropTypes.func,
    setField: PropTypes.func,
    setFieldSrc: PropTypes.func,
    setOperator: PropTypes.func,
    setOperatorOption: PropTypes.func,
    setLock: PropTypes.func,
    removeSelf: PropTypes.func,
    setValue: PropTypes.func,
    setValueSrc: PropTypes.func,
    setFuncValue: PropTypes.func,
    reordableNodesCnt: PropTypes.number,
    totalRulesCnt: PropTypes.number,
    parentReordableNodesCnt: PropTypes.number,
    parentFieldCanReorder: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);
  
    this.removeSelf = this.removeSelf.bind(this);
    this.setLock = this.setLock.bind(this);

    this.onPropsChanged(props);
  }

  onPropsChanged(nextProps) {
    const prevProps = this.props;
    const configChanged = !this.Icon || prevProps?.config !== nextProps?.config;
    const keysForMeta = ["selectedField", "selectedFieldSrc", "selectedFieldType", "selectedOperator", "config", "reordableNodesCnt", "isLocked", "parentField", "parentFieldCanReorder"];
    const needUpdateMeta = !this.meta || keysForMeta.map(k => (nextProps[k] !== prevProps[k])).filter(ch => ch).length > 0;

    if (needUpdateMeta) {
      this.meta = this.getMeta(nextProps);
    }
    if (configChanged) {
      const { config } = nextProps;
      const {
        renderIcon, renderButton, renderButtonGroup, renderSwitch, renderBeforeWidget, renderAfterWidget, renderRuleError,
      } = config.settings;
      this.Icon = getRenderFromConfig(config, renderIcon);
      this.Btn = getRenderFromConfig(config, renderButton);
      this.BtnGrp = getRenderFromConfig(config, renderButtonGroup);
      this.Switch = getRenderFromConfig(config, renderSwitch);
      this.BeforeWidget = getRenderFromConfig(config, renderBeforeWidget);
      this.AfterWidget = getRenderFromConfig(config, renderAfterWidget);
      this.RuleError = getRenderFromConfig(config, renderRuleError);
    }
    this.doRemove = () => {
      this.props.removeSelf();
    };
  }

  getMeta({selectedField, selectedFieldType, selectedOperator, config, reordableNodesCnt, isLocked, parentField, parentFieldCanReorder}) {
    const {keepInputOnChangeFieldSrc} = config.settings;
    const selectedFieldId = getFieldId(selectedField, config);
    const selectedFieldConfig = getFieldConfig(config, selectedField);
    const isSelectedGroup = selectedFieldConfig && selectedFieldConfig.type === "!struct";
    const isOkWithoutField = keepInputOnChangeFieldSrc && selectedFieldType;
    const isFieldSelected = !!selectedField || isOkWithoutField;
    const isFieldAndOpSelected = isFieldSelected && selectedOperator;
    const selectedOperatorConfig = getOperatorConfig(config, selectedOperator, selectedField);
    const selectedOperatorHasOptions = selectedOperatorConfig && selectedOperatorConfig.options != null;
    const selectedFieldWidgetConfig = getFieldWidgetConfig(config, selectedField, selectedOperator, null, null) || {};
    const hideOperator = selectedFieldWidgetConfig.hideOperator;

    let showDragIcon = config.settings.canReorder && reordableNodesCnt > 1 && !isLocked;
    if (parentField) {
      showDragIcon = showDragIcon && parentFieldCanReorder;
    }
    const showOperator = isFieldSelected && !hideOperator;
    const showOperatorLabel = isFieldSelected && hideOperator && selectedFieldWidgetConfig.operatorInlineLabel;
    const showWidget = isFieldAndOpSelected && !isSelectedGroup;
    const showOperatorOptions = isFieldAndOpSelected && selectedOperatorHasOptions;

    return {
      selectedFieldId, selectedFieldWidgetConfig,
      showDragIcon, showOperator, showOperatorLabel, showWidget, showOperatorOptions
    };
  }

  setLock(lock) {
    this.props.setLock(lock);
  }

  removeSelf() {
    const {confirmFn, config} = this.props;
    const {renderConfirm, removeRuleConfirmOptions: confirmOptions} = config.settings;
    if (confirmOptions && !this.isEmptyCurrentRule()) {
      renderConfirm.call(config.ctx, {...confirmOptions,
        onOk: this.doRemove,
        onCancel: null,
        confirmFn: confirmFn
      }, config.ctx);
    } else {
      this.doRemove();
    }
  }

  _buildWidgetProps({
    selectedField, selectedFieldSrc, selectedFieldType,
    selectedOperator, operatorOptions,
    value, valueType, valueSrc, asyncListValues, valueError, fieldError,
    parentField,
  }, {
    selectedFieldId
  }) {
    return {
      field: selectedField,
      fieldSrc: selectedFieldSrc,
      fieldType: selectedFieldType,
      fieldId: selectedFieldId,
      operator: selectedOperator,
      operatorOptions,
      value,
      valueType,
      valueSrc,
      asyncListValues,
      valueError,
      fieldError,
      parentField,
    };
  }

  isEmptyCurrentRule() {
    const {config} = this.props;
    const ruleData = this._buildWidgetProps(this.props, this.meta);
    return isEmptyRuleProperties(ruleData, config);
  }

  renderField() {
    const {
      config, isLocked, parentField, groupId, id,
      selectedFieldSrc, selectedField, selectedFieldType, setField, setFuncValue, setFieldSrc, fieldError,
    } = this.props;
    const { immutableFieldsMode } = config.settings;
    const { selectedFieldId } = this.meta;
    // tip: don't allow function inside !group (yet)

    return <FieldWrapper
      key="field"
      classname={classNames(
        selectedFieldSrc == "func" ? "rule--field--func" : "rule--field",
      )}
      config={config}
      canSelectFieldSource={!parentField}
      selectedField={selectedField}
      selectedFieldSrc={selectedFieldSrc}
      selectedFieldType={selectedFieldType}
      selectedFieldId={selectedFieldId}
      fieldError={fieldError}
      setField={!immutableFieldsMode ? setField : dummyFn}
      setFuncValue={!immutableFieldsMode ? setFuncValue : dummyFn}
      setFieldSrc={!immutableFieldsMode ? setFieldSrc : dummyFn}
      parentField={parentField}
      readonly={immutableFieldsMode || isLocked}
      id={id}
      groupId={groupId}
    />;
  }

  renderOperator () {
    const {config, isLocked} = this.props;
    const {
      selectedFieldId, selectedFieldWidgetConfig, showOperator, showOperatorLabel
    } = this.meta;
    const { immutableOpsMode } = config.settings;
    
    return <OperatorWrapper
      key="operator"
      config={config}
      selectedField={this.props.selectedField}
      selectedFieldSrc={this.props.selectedFieldSrc}
      selectedFieldType={this.props.selectedFieldType}
      selectedFieldId={selectedFieldId}
      selectedOperator={this.props.selectedOperator}
      setOperator={!immutableOpsMode ? this.props.setOperator : dummyFn}
      showOperator={showOperator}
      showOperatorLabel={showOperatorLabel}
      selectedFieldWidgetConfig={selectedFieldWidgetConfig}
      readonly={immutableOpsMode || isLocked}
      id={this.props.id}
      groupId={this.props.groupId}
    />;
  }

  renderWidget() {
    const {config, isLocked} = this.props;
    const { showWidget } = this.meta;
    const { immutableValuesMode } = config.settings;
    if (!showWidget) return null;

    const widget = <Widget
      key="values"
      {...this._buildWidgetProps(this.props, this.meta)}
      config={config}
      setValue={!immutableValuesMode ? this.props.setValue : dummyFn}
      setValueSrc={!immutableValuesMode ? this.props.setValueSrc : dummyFn}
      setFuncValue={!immutableValuesMode ? this.props.setFuncValue : dummyFn}
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

  renderOperatorOptions() {
    const {config} = this.props;
    const { showOperatorOptions } = this.meta;
    const { immutableOpsMode, immutableValuesMode } = config.settings;
    if (!showOperatorOptions) return null;

    const opOpts = <OperatorOptions
      key="operatorOptions"
      selectedField={this.props.selectedField}
      selectedOperator={this.props.selectedOperator}
      operatorOptions={this.props.operatorOptions}
      setOperatorOption={!immutableOpsMode ? this.props.setOperatorOption : dummyFn}
      config={config}
      readonly={immutableValuesMode}
    />;

    return (
      <Col key={"op-options-for-"+this.props.selectedOperator} className="rule--operator-options">
        {opOpts}
      </Col>
    );
  }

  renderBeforeWidget() {
    const BeforeWidget = this.BeforeWidget;
    if (!BeforeWidget)
      return null;
    return <Col key={"before-widget-for-" +this.props.selectedOperator} className="rule--before-widget">
      <BeforeWidget {...this.props} />
    </Col>;
  }

  renderAfterWidget() {
    const AfterWidget = this.AfterWidget;
    if (!AfterWidget)
      return null;
    return <Col key={"after-widget-for-" +this.props.selectedOperator} className="rule--after-widget">
      <AfterWidget {...this.props} />
    </Col>;
  }

  renderError() {
    const {config, valueError, fieldError} = this.props;
    const { showErrorMessage } = config.settings;
    const RuleError = this.RuleError;
    const oneError = [fieldError, ...(valueError?.toArray() || [])].filter(e => !!e).shift() || null;
    return showErrorMessage && oneError 
      && <div className="rule--error">
        {RuleError ? <RuleError error={oneError} /> : oneError}
      </div>;
  }

  renderDrag() {
    const { handleDraggerMouseDown, config, isLocked } = this.props;
    const { showDragIcon } = this.meta;
    const Icon = this.Icon;
    const icon = <Icon
      type="drag"
      config={config}
      readonly={isLocked}
    />;
    return showDragIcon && (<div 
      key="rule-drag-icon"
      onMouseDown={handleDraggerMouseDown}
      className={"qb-drag-handler rule--drag-handler"}
    >{icon}</div>);
  }

  renderDel() {
    const {config, isLocked} = this.props;
    const {
      deleteLabel,
      immutableGroupsMode,
      canDeleteLocked
    } = config.settings;
    const Icon = this.Icon;
    const Btn = this.Btn;

    return !immutableGroupsMode && (!isLocked || isLocked && canDeleteLocked) && (
      <Btn
        key="rule-del"
        type="delRule"
        onClick={this.removeSelf}
        label={deleteLabel}
        config={config}
        renderIcon={Icon}
      />
    );
  }

  renderLock() {
    const {config, isLocked, isTrueLocked, id} = this.props;
    const {
      lockLabel, lockedLabel, showLock,
    } = config.settings;
    const Switch = this.Switch;
      
    return showLock && !(isLocked && !isTrueLocked) && (
      <Switch
        key="rule-lock"
        type="lock"
        id={id}
        value={isLocked}
        setValue={this.setLock}
        label={lockLabel}
        checkedLabel={lockedLabel}
        hideLabel={true}
        config={config}
      />
    );
  }

  render () {
    const { showOperatorOptions, selectedFieldWidgetConfig } = this.meta;
    const { valueSrc, value, config } = this.props;
    const canShrinkValue = valueSrc?.first() == "value" && !showOperatorOptions && value.size == 1 && selectedFieldWidgetConfig.fullWidth;
    const BtnGrp = this.BtnGrp;

    const parts = [
      this.renderField(),
      this.renderOperator(),
      this.renderBeforeWidget(),
      this.renderWidget(),
      this.renderAfterWidget(),
      this.renderOperatorOptions(),
    ];
    const body = <div key="rule-body" className={classNames("rule--body", canShrinkValue && "can--shrink--value")}>{parts}</div>;

    const error = this.renderError();
    const drag = this.renderDrag();
    const lock = this.renderLock();
    const del = this.renderDel();

    return (
      <>
        {drag}
        <div key="rule-body-wrapper" className="rule--body--wrapper">
          {body}{error}
        </div>
        <div key="rule-header-wrapper" className="rule--header">
          <BtnGrp key="rule-header-group" config={config}>
            {lock}
            {del}
          </BtnGrp>
        </div>
      </>
    );
  }

}


export default RuleContainer(Draggable("rule")(WithConfirmFn(Rule)));
