import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RuleContainer from './containers/RuleContainer';
import DraggableRule from './containers/DraggableRule';
import Field from './Field';
import Operator from './Operator';
import Widget from './Widget';
import OperatorOptions from './OperatorOptions';
import { Col, Icon, Button, Modal } from 'antd';
const { confirm } = Modal;
import {getFieldConfig, getFieldPathLabels, getOperatorConfig, getFieldWidgetConfig} from "../utils/configUtils";
const classNames = require('classnames');
import PureRenderMixin from 'react-addons-pure-render-mixin';


@RuleContainer
@DraggableRule
class Rule extends Component {
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

    pureShouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    shouldComponentUpdate = this.pureShouldComponentUpdate;

    constructor(props) {
        super(props);
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
        const selectedFieldPartsLabels = getFieldPathLabels(this.props.selectedField, this.props.config);
        const selectedFieldConfig = getFieldConfig(this.props.selectedField, this.props.config);
        const isSelectedGroup = selectedFieldConfig && selectedFieldConfig.type == '!struct';
        const isFieldAndOpSelected = this.props.selectedField && this.props.selectedOperator && !isSelectedGroup;
        const selectedOperatorConfig = getOperatorConfig(this.props.config, this.props.selectedOperator, this.props.selectedField);
        const selectedOperatorHasOptions = selectedOperatorConfig && selectedOperatorConfig.options != null;
        const selectedFieldWidgetConfig = getFieldWidgetConfig(this.props.config, this.props.selectedField, this.props.selectedOperator) || {};

        const showDragIcon = this.props.config.settings.canReorder && this.props.treeNodesCnt > 2;
        const showOperator = this.props.selectedField && !selectedFieldWidgetConfig.hideOperator;
        const showOperatorLabel = this.props.selectedField && selectedFieldWidgetConfig.hideOperator && selectedFieldWidgetConfig.operatorInlineLabel;
        const showWidget = isFieldAndOpSelected;
        const showOperatorOptions = isFieldAndOpSelected && selectedOperatorHasOptions;

        return [
            <div key="rule-header" className="rule--header">
                {!this.props.config.settings.readonlyMode &&
                    <Button
                        type="danger"
                        icon="delete"
                        onClick={this.removeSelf}
                        size={this.props.config.settings.renderSize || "small"}
                    >
                        {this.props.config.settings.deleteLabel !== undefined ? this.props.config.settings.deleteLabel : "Delete"}
                    </Button>
                }
            </div>
        , showDragIcon &&
            <span key="rule-drag-icon" className={"qb-drag-handler"} onMouseDown={this.props.handleDraggerMouseDown} ><Icon type="bars" /> </span>
        ,
            <Col key={"fields"} className="rule--field">
                { this.props.config.settings.showLabels &&
                    <label>{this.props.config.settings.fieldLabel || "Field"}</label>
                }
                <Field
                    key="field"
                    config={this.props.config}
                    selectedField={this.props.selectedField}
                    setField={this.props.setField}
                    renderAsDropdown={this.props.config.settings.renderFieldAndOpAsDropdown}
                    customProps={this.props.config.settings.customFieldSelectProps}
                />
            </Col>
        , showOperator &&
            <Col key={"operators-for-"+(selectedFieldPartsLabels || []).join("_")} className="rule--operator">
                { this.props.config.settings.showLabels &&
                    <label>{this.props.config.settings.operatorLabel || "Operator"}</label>
                }
                <Operator
                    key="operator"
                    config={this.props.config}
                    selectedField={this.props.selectedField}
                    selectedOperator={this.props.selectedOperator}
                    setOperator={this.props.setOperator}
                    renderAsDropdown={this.props.config.settings.renderFieldAndOpAsDropdown}
                />
            </Col>
        , showOperatorLabel &&
            <Col key={"operators-for-"+(selectedFieldPartsLabels || []).join("_")} className="rule--operator">
                <div className="rule--operator">
                    {this.props.config.settings.showLabels ?
                        <label>&nbsp;</label>
                    : null}
                    <span>{selectedFieldWidgetConfig.operatorInlineLabel}</span>
                </div>
            </Col>
        , showWidget &&
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
            </Col>
        , showOperatorOptions &&
            <Col key={"op-options-for-"+this.props.selectedOperator} className="rule--operator-options">
                <OperatorOptions
                    key="operatorOptions"
                    selectedField={this.props.selectedField}
                    selectedOperator={this.props.selectedOperator}
                    operatorOptions={this.props.operatorOptions}
                    setOperatorOption={this.props.setOperatorOption}
                    config={this.props.config}
                />
            </Col>
        ];
    }

}

export default Rule;