import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import RuleContainer from "./containers/RuleContainer";
import Draggable from "./containers/Draggable";
import OperatorWrapper from "./OperatorWrapper";
import FieldWrapper from "./FieldWrapper";
import WidgetWrapper from "./WidgetWrapper";
import OperatorOptions from "./OperatorOptions";
import {getFieldConfig, getFieldPathLabels, getOperatorConfig, getFieldWidgetConfig} from "../utils/configUtils";
import {useOnPropsChanged} from "../utils/stuff";
import {Col, DragIcon, dummyFn, ConfirmFn} from "./utils";


@RuleContainer
@Draggable("rule")
@ConfirmFn
class Rule extends PureComponent {
    static propTypes = {
      selectedField: PropTypes.string,
      selectedOperator: PropTypes.string,
      operatorOptions: PropTypes.object,
      config: PropTypes.object.isRequired,
      value: PropTypes.any, //depends on widget
      valueSrc: PropTypes.any,
      isDraggingMe: PropTypes.bool,
      isDraggingTempo: PropTypes.bool,
      parentField: PropTypes.string, //from RuleGroup
      valueError: PropTypes.any,
      //path: PropTypes.instanceOf(Immutable.List),
      //actions
      handleDraggerMouseDown: PropTypes.func,
      setField: PropTypes.func,
      setOperator: PropTypes.func,
      setOperatorOption: PropTypes.func,
      removeSelf: PropTypes.func,
      setValue: PropTypes.func,
      setValueSrc: PropTypes.func,
      reordableNodesCnt: PropTypes.number,
    };

    constructor(props) {
      super(props);
      useOnPropsChanged(this);

      this.onPropsChanged(props);
    }

    onPropsChanged(nextProps) {
      const prevProps = this.props;
      const keysForMeta = ["selectedField", "selectedOperator", "config", "reordableNodesCnt"];
      const needUpdateMeta = !this.meta || keysForMeta.map(k => (nextProps[k] !== prevProps[k])).filter(ch => ch).length > 0;

      if (needUpdateMeta) {
        this.meta = this.getMeta(nextProps);
      }
    }

    getMeta({selectedField, selectedOperator, config, reordableNodesCnt}) {
      const selectedFieldPartsLabels = getFieldPathLabels(selectedField, config);
      const selectedFieldConfig = getFieldConfig(selectedField, config);
      const isSelectedGroup = selectedFieldConfig && selectedFieldConfig.type == "!struct";
      const isFieldAndOpSelected = selectedField && selectedOperator && !isSelectedGroup;
      const selectedOperatorConfig = getOperatorConfig(config, selectedOperator, selectedField);
      const selectedOperatorHasOptions = selectedOperatorConfig && selectedOperatorConfig.options != null;
      const selectedFieldWidgetConfig = getFieldWidgetConfig(config, selectedField, selectedOperator) || {};
      const isOnlyValue = selectedField && selectedFieldConfig.valueSources.length == 1 && selectedFieldConfig.valueSources[0] == "value";
      const hideOperator = selectedFieldWidgetConfig.hideOperator && isOnlyValue;

      const showDragIcon = config.settings.canReorder && reordableNodesCnt > 1;
      const showOperator = selectedField && !hideOperator;
      const showOperatorLabel = selectedField && hideOperator && selectedFieldWidgetConfig.operatorInlineLabel;
      const showWidget = isFieldAndOpSelected;
      const showOperatorOptions = isFieldAndOpSelected && selectedOperatorHasOptions;

      return {
        selectedFieldPartsLabels, selectedFieldWidgetConfig,
        showDragIcon, showOperator, showOperatorLabel, showWidget, showOperatorOptions
      };
    }

    removeSelf() {
      const {confirmFn} = this.props;
      const {renderConfirm, removeRuleConfirmOptions: confirmOptions} = this.props.config.settings;
      const doRemove = () => {
        this.props.removeSelf();
      };
      if (confirmOptions && !this.isEmptyCurrentRule()) {
        renderConfirm({...confirmOptions,
          onOk: doRemove,
          onCancel: null,
          confirmFn: confirmFn
        });
      } else {
        doRemove();
      }
    }

    isEmptyCurrentRule() {
      return !(
        this.props.selectedField !== null
            && this.props.selectedOperator !== null
            && this.props.value.filter((val) => val !== undefined).size > 0
      );
    }

    renderField() {
      const {config} = this.props;
      const { immutableFieldsMode } = config.settings;

      return <FieldWrapper
        key="field"
        classname={"rule--field"}
        config={config}
        selectedField={this.props.selectedField}
        setField={!immutableFieldsMode ? this.props.setField : dummyFn}
        parentField={this.props.parentField}
        readonly={immutableFieldsMode}
      />;
    }

    renderOperator () {
      const {config} = this.props;
      const {
        selectedFieldPartsLabels, selectedFieldWidgetConfig, showOperator, showOperatorLabel
      } = this.meta;
      const { immutableOpsMode } = config.settings;

      return <OperatorWrapper
        key="operator"
        config={config}
        selectedField={this.props.selectedField}
        selectedOperator={this.props.selectedOperator}
        setOperator={!immutableOpsMode ? this.props.setOperator : dummyFn}
        selectedFieldPartsLabels={selectedFieldPartsLabels}
        showOperator={showOperator}
        showOperatorLabel={showOperatorLabel}
        selectedFieldWidgetConfig={selectedFieldWidgetConfig}
        readonly={immutableOpsMode}
      />;
    }

    renderWidget() {
      const {config, valueError} = this.props;
      const { showWidget } = this.meta;
      const { immutableValuesMode } = config.settings;
      if (!showWidget) return null;

      const widget = <WidgetWrapper
        key="values"
        field={this.props.selectedField}
        operator={this.props.selectedOperator}
        value={this.props.value}
        valueSrc={this.props.valueSrc}
        valueError={valueError}
        config={config}
        setValue={!immutableValuesMode ? this.props.setValue : dummyFn}
        setValueSrc={!immutableValuesMode ? this.props.setValueSrc : dummyFn}
        readonly={immutableValuesMode}
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
      const {config} = this.props;
      const { renderBeforeWidget } = config.settings;
      return renderBeforeWidget 
        && <Col key={"before-widget-for-" +this.props.selectedOperator} className="rule--before-widget">
          {typeof renderBeforeWidget === "function" ? renderBeforeWidget(this.props) : renderBeforeWidget}
        </Col>;
    }

    renderAfterWidget() {
      const {config} = this.props;
      const { renderAfterWidget } = config.settings;
      return renderAfterWidget 
        && <Col key={"after-widget-for-" +this.props.selectedOperator} className="rule--after-widget">
          {typeof renderAfterWidget === "function" ? renderAfterWidget(this.props) : renderAfterWidget}
        </Col>;
    }

    renderError() {
      const {config, valueError} = this.props;
      const { renderRuleError, showErrorMessage } = config.settings;
      const oneValueError = valueError && valueError.toArray().filter(e => !!e).shift() || null;
      return showErrorMessage && oneValueError 
        && <div className="rule--error">
          {renderRuleError ? renderRuleError({error: oneValueError}) : oneValueError}
        </div>;
    }

    renderDrag() {
      const { showDragIcon } = this.meta;

      return showDragIcon
        && <span
          key="rule-drag-icon"
          className={"qb-drag-handler rule--drag-handler"}
          onMouseDown={this.props.handleDraggerMouseDown}
        ><DragIcon /> </span>;
    }

    renderDel() {
      const {config} = this.props;
      const {
        deleteLabel, renderSize, 
        immutableGroupsMode, 
        renderButton: Btn
      } = config.settings;

      return (
        <div key="rule-header" className="rule--header">
          {!immutableGroupsMode && <Btn 
            type="delRule" onClick={this.removeSelf} label={deleteLabel} config={config}
          />}
        </div>
      );
    }

    render () {
      const parts = [
        this.renderField(),
        this.renderOperator(),
        this.renderBeforeWidget(),
        this.renderWidget(),
        this.renderAfterWidget(),
        this.renderOperatorOptions(),
      ];
      const body = <div key="rule-body" className="rule--body">{parts}</div>;

      const error = this.renderError();
      const drag = this.renderDrag();
      const del = this.renderDel();

      return (
        <>
          {drag}
          <div className="rule--body--wrapper">
            {body}{error}
          </div>
          {del}
        </>
      );
    }

}


export default Rule;
