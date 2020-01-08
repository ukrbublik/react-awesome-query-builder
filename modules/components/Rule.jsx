import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import RuleContainer from './containers/RuleContainer';
import Draggable from './containers/Draggable';
import Field from './Field';
import Operator from './Operator';
import Widget from './Widget';
import OperatorOptions from './OperatorOptions';
import { Col, Icon, Button, Modal } from 'antd';
const { confirm } = Modal;
import {getFieldConfig, getFieldPathLabels, getOperatorConfig, getFieldWidgetConfig} from "../utils/configUtils";
import {useOnPropsChange} from "../utils/stuff";


@RuleContainer
@Draggable("rule")
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
        //path: PropTypes.instanceOf(Immutable.List),
        //actions
        handleDraggerMouseDown: PropTypes.func,
        setField: PropTypes.func,
        setOperator: PropTypes.func,
        setOperatorOption: PropTypes.func,
        removeSelf: PropTypes.func,
        setValue: PropTypes.func,
        setValueSrc: PropTypes.func,
        treeNodesCnt: PropTypes.number,
    };

    constructor(props) {
        super(props);
        useOnPropsChange(this);

        this.onPropsChanged(props);
    }

    onPropsChanged(nextProps) {
        const prevProps = this.props;
        const keysForMeta = ["selectedField", "selectedOperator", "config", "treeNodesCnt"];
        const needUpdateMeta = !this.meta || keysForMeta.map(k => (nextProps[k] !== prevProps[k])).filter(ch => ch).length > 0;

        if (needUpdateMeta) {
            this.meta = this.getMeta(nextProps);
        }
    }

    getMeta({selectedField, selectedOperator, config, treeNodesCnt}) {
        const selectedFieldPartsLabels = getFieldPathLabels(selectedField, config);
        const selectedFieldConfig = getFieldConfig(selectedField, config);
        const isSelectedGroup = selectedFieldConfig && selectedFieldConfig.type == '!struct';
        const isFieldAndOpSelected = selectedField && selectedOperator && !isSelectedGroup;
        const selectedOperatorConfig = getOperatorConfig(config, selectedOperator, selectedField);
        const selectedOperatorHasOptions = selectedOperatorConfig && selectedOperatorConfig.options != null;
        const selectedFieldWidgetConfig = getFieldWidgetConfig(config, selectedField, selectedOperator) || {};
        const isOnlyValue = selectedField && selectedFieldConfig.valueSources.length == 1 && selectedFieldConfig.valueSources[0] == 'value';
        const hideOperator = selectedFieldWidgetConfig.hideOperator && isOnlyValue;

        const showDragIcon = config.settings.canReorder && treeNodesCnt > 2;
        const showOperator = selectedField && !hideOperator;
        const showOperatorLabel = selectedField && hideOperator && selectedFieldWidgetConfig.operatorInlineLabel;
        const showWidget = isFieldAndOpSelected;
        const showOperatorOptions = isFieldAndOpSelected && selectedOperatorHasOptions;

        return {
            selectedFieldPartsLabels, selectedFieldWidgetConfig,
            showDragIcon, showOperator, showOperatorLabel, showWidget, showOperatorOptions
        };
    }

    removeSelf = () => {
      const confirmOptions = this.props.config.settings.removeRuleConfirmOptions;
      const doRemove = () => {
        this.props.removeSelf();
      };
      if (confirmOptions && !this.isEmptyCurrentRule()) {
        confirm({...confirmOptions,
          onOk: doRemove,
          onCancel: null
        });
      } else {
        doRemove();
      }
    }

    isEmptyCurrentRule = () => {
        return !(
            this.props.selectedField !== null &&
            this.props.selectedOperator !== null &&
            this.props.value.filter((val) => val !== undefined).size > 0
        );
    }

    render () {
        const {
            selectedFieldPartsLabels, selectedFieldWidgetConfig,
            showDragIcon, showOperator, showOperatorLabel, showWidget, showOperatorOptions
        } = this.meta;
        const deleteText = this.props.config.settings.deleteLabel;

        const field = 
            <FieldWrapper
                key="field"
                config={this.props.config}
                selectedField={this.props.selectedField}
                setField={this.props.setField}
            />;
        const operator = 
            <OperatorWrapper
                key="operator"
                config={this.props.config}
                selectedField={this.props.selectedField}
                selectedOperator={this.props.selectedOperator}
                setOperator={this.props.setOperator}
                selectedFieldPartsLabels={selectedFieldPartsLabels}
                showOperator={showOperator}
                showOperatorLabel={showOperatorLabel}
                selectedFieldWidgetConfig={selectedFieldWidgetConfig}
            />;

        const widget = showWidget &&
            <Col key={"widget-for-"+this.props.selectedOperator} className="rule--value">
                <Widget
                    key="values"
                    field={this.props.selectedField}
                    operator={this.props.selectedOperator}
                    value={this.props.value}
                    valueSrc={this.props.valueSrc}
                    config={this.props.config}
                    setValue={this.props.setValue}
                    setValueSrc={this.props.setValueSrc}
                />
            </Col>;
        const operatorOptions = showOperatorOptions &&
            <Col key={"op-options-for-"+this.props.selectedOperator} className="rule--operator-options">
                <OperatorOptions
                    key="operatorOptions"
                    selectedField={this.props.selectedField}
                    selectedOperator={this.props.selectedOperator}
                    operatorOptions={this.props.operatorOptions}
                    setOperatorOption={this.props.setOperatorOption}
                    config={this.props.config}
                />
            </Col>;

        const parts = [
            field,
            operator,
            widget,
            operatorOptions
        ];

        const drag = showDragIcon &&
            <span
                key="rule-drag-icon"
                className={"qb-drag-handler rule--drag-handler"}
                onMouseDown={this.props.handleDraggerMouseDown}
            ><Icon type="bars" /> </span>
        ;

        const del = (
            <div key="rule-header" className="rule--header">
            {!this.props.config.settings.immutableGroupsMode &&
                <Button
                    type="danger"
                    icon="delete"
                    onClick={this.removeSelf}
                    size={this.props.config.settings.renderSize}
                >
                    {deleteText}
                </Button>
            }
            </div>
        );

        const body = <div key="rule-body" className="rule--body">{parts}</div>;

        return [
            drag,
            body,
            del
        ];
    }

}


class FieldWrapper extends PureComponent {
    render() {
        const {config, selectedField, setField} = this.props;
        return (
            <Col className="rule--field">
                { config.settings.showLabels &&
                    <label>{config.settings.fieldLabel}</label>
                }
                <Field
                    config={config}
                    selectedField={selectedField}
                    setField={setField}
                    customProps={config.settings.customFieldSelectProps}
                />
            </Col>
        );
    }
}


class OperatorWrapper extends PureComponent {
    render() {
        const {
            config, selectedField, selectedOperator, setOperator, 
            selectedFieldPartsLabels, showOperator, showOperatorLabel, selectedFieldWidgetConfig
        } = this.props;
        const operator = showOperator &&
            <Col key={"operators-for-"+(selectedFieldPartsLabels || []).join("_")} className="rule--operator">
                { config.settings.showLabels &&
                    <label>{config.settings.operatorLabel}</label>
                }
                <Operator
                    key="operator"
                    config={config}
                    selectedField={selectedField}
                    selectedOperator={selectedOperator}
                    setOperator={setOperator}
                />
            </Col>;
        const hiddenOperator = showOperatorLabel &&
            <Col key={"operators-for-"+(selectedFieldPartsLabels || []).join("_")} className="rule--operator">
                <div className="rule--operator">
                    {config.settings.showLabels ?
                        <label>&nbsp;</label>
                    : null}
                    <span>{selectedFieldWidgetConfig.operatorInlineLabel}</span>
                </div>
            </Col>;
        return [
            operator,
            hiddenOperator
        ];
    }
}

export default Rule;
