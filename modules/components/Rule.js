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

@RuleContainer
export default class Rule extends Component {
    static propTypes = {
        selectedField: PropTypes.string,
        selectedOperator: PropTypes.string,
        operatorOptions: PropTypes.object.isRequired,
        config: PropTypes.object.isRequired,
        //actions
        setField: PropTypes.func.isRequired,
        setOperator: PropTypes.func.isRequired,
        setOperatorOption: PropTypes.func.isRequired,
        removeSelf: PropTypes.func.isRequired,
    };

    shouldComponentUpdate = shallowCompare;

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        let selectedFieldPartsLabels = getFieldPathLabels(this.props.selectedField, this.props.config);
        const selectedFieldConfig = getFieldConfig(this.props.selectedField, this.props.config);
        let isSelectedGroup = selectedFieldConfig && selectedFieldConfig.widget == '!struct';
        let isFieldAndOpSelected = this.props.selectedField && this.props.selectedOperator && !isSelectedGroup;

        const selectedOperatorConfig = this.props.config.operators[this.props.selectedOperator];
        let selectedOperatorHasOptions = selectedOperatorConfig && selectedOperatorConfig.options != null;

        return (
            <div className="rule">
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
                        {this.props.selectedField ? (
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
                        ) : null}
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
