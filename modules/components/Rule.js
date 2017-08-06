import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import shallowCompare from 'react-addons-shallow-compare';
import RuleContainer from './containers/RuleContainer';
import Field from './Field';
import Operator from './Operator';
import Widget from './Widget';
import OperatorOptions from './OperatorOptions';
import { Row, Col, Menu, Dropdown, Icon, Tooltip, Button } from 'antd';
const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;
const DropdownButton = Dropdown.Button;
import {getFieldConfig, getFieldPath, getFieldPathLabels} from "../utils/index";
import size from 'lodash/size';
var stringify = require('json-stringify-safe');
const classNames = require('classnames');

@RuleContainer
export default class Rule extends Component {
    static propTypes = {
        selectedField: PropTypes.string,
        selectedOperator: PropTypes.string,
        operatorOptions: PropTypes.object.isRequired,
        config: PropTypes.object.isRequired,
        //actions
        setField: PropTypes.func,
        setOperator: PropTypes.func,
        setOperatorOption: PropTypes.func,
        removeSelf: PropTypes.func,
    };

    shouldComponentUpdate = shallowCompare;

    constructor(props) {
        super(props);
        this.state = {};
    }

    handleDraggerMouseDown (e) {
        var nodeId = this.props.id;
        var dom = this.refs.rule;

        if (this.props.onDragStart) {
          this.props.onDragStart(nodeId, dom, e);
        }
    }

    render () {
        let selectedFieldPartsLabels = getFieldPathLabels(this.props.selectedField, this.props.config);
        const selectedFieldConfig = getFieldConfig(this.props.selectedField, this.props.config);
        let isSelectedGroup = selectedFieldConfig && selectedFieldConfig.widget == '!struct';
        let isFieldAndOpSelected = this.props.selectedField && this.props.selectedOperator && !isSelectedGroup;
        //const widgetConfig = config.widgets[selectedFieldConfig.widget] || {};

        const selectedOperatorConfig = this.props.config.operators[this.props.selectedOperator];
        let selectedOperatorHasOptions = selectedOperatorConfig && selectedOperatorConfig.options != null;

        let styles = {};
        if (this.props.renderType == 'dragging') {
            styles = {
                top: this.props.dragging.y,
                left: this.props.dragging.x,
                width: this.props.dragging.w
            };
        }

        return (
            <div 
                className={classNames("rule", "group-or-rule", 
                    this.props.renderType == 'placeholder' ? 'qb-placeholder' : null,
                    this.props.renderType == 'dragging' ? 'qb-draggable' : null,
                )} 
                style={styles}
                ref="rule" 
                data-id={this.props.id}
            >
                <div className="rule--header">
                    <Button 
                        type="danger"
                        icon="delete"
                        onClick={this.props.removeSelf}
                        size={this.props.config.settings.renderSize || "small"}
                    >
                        {this.props.config.settings.deleteLabel !== undefined ? this.props.config.settings.deleteLabel : "Delete"}
                    </Button>
                </div>
                <div className="rule--body">
                    <Row>
                        { this.props.canReorder &&
                            <span onMouseDown={this.handleDraggerMouseDown.bind(this)} >###</span>
                        }
                        {true ? (
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
                                />
                            </Col>
                        ) : null}
                        {this.props.selectedField && !selectedFieldConfig.hideOperator && (
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
                        )}
                        {this.props.selectedField && selectedFieldConfig.hideOperator && selectedFieldConfig.operatorLabel && (
                            <Col key={"operators-for-"+(selectedFieldPartsLabels || []).join("_")} className="rule--operator">
                                <div className="rule--operator">
                                    {this.props.config.settings.showLabels ?
                                        <label>&nbsp;</label>
                                    : null}
                                    <span>{selectedFieldConfig.operatorLabel}</span>
                                </div>
                            </Col>
                        )}
                        {isFieldAndOpSelected && selectedOperatorHasOptions &&
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
                        }
                        {isFieldAndOpSelected &&
                            <Col key={"widget-for-"+this.props.selectedOperator} className="rule--value">
                                <Widget
                                  key="values"
                                  field={this.props.selectedField}
                                  operator={this.props.selectedOperator}
                                  value={this.props.value}
                                  config={this.props.config} 
                                  setValue={this.props.setValue}
                                />
                            </Col>
                        }
                    </Row>
                </div>
            </div>
        );
    }

}
