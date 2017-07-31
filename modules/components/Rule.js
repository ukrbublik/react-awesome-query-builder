import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import shallowCompare from 'react-addons-shallow-compare';
import RuleContainer from './containers/RuleContainer';
import { Row, Col, Menu, Dropdown, Icon, Tooltip, Button } from 'antd';
const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;
const DropdownButton = Dropdown.Button;
import {getFieldConfig, getFieldPath, getFieldPathLabels} from "../utils/index";
import map from 'lodash/map';
import size from 'lodash/size';
import last from 'lodash/last';
import keys from 'lodash/keys';
import pickBy from 'lodash/pickBy';
import omitBy from 'lodash/omitBy';
import mapKeys from 'lodash/mapKeys';
import mapValues from 'lodash/mapValues';

var stringify = require('json-stringify-safe');

@RuleContainer
export default class Rule extends Component {
    static propTypes = {
        setField: PropTypes.func.isRequired,
        setOperator: PropTypes.func.isRequired,
        removeSelf: PropTypes.func.isRequired,
        selectedField: PropTypes.string,
        selectedOperator: PropTypes.string,
        config: PropTypes.object.isRequired,
    };

    shouldComponentUpdate = shallowCompare;

    constructor(props) {
        super(props);
        this.onPropsChanged(props);
        this.state = {
        };
    }

    componentWillReceiveProps (props) {
        this.onPropsChanged(props);
    }

    onPropsChanged (props) {
        this.fieldSeparator = props.config.settings.fieldSeparator;
        this.fieldSeparatorDisplay = props.config.settings.fieldSeparatorDisplay;

        this.fieldOptions = props.config.fields;
        let fieldConfig = getFieldConfig(props.selectedField, props.config);
        this.operatorOptions = mapValues(pickBy(props.config.operators, (item, index) =>
            fieldConfig && fieldConfig.operators && fieldConfig.operators.indexOf(index) !== -1
        ));
    }

    curFieldOpts() {
        return Object.assign({}, {label: this.props.selectedField}, getFieldConfig(this.props.selectedField, this.props.config) || {});
    }

    curOpOpts() {
        return Object.assign({}, {label: this.props.selectedOperator}, this.operatorOptions[this.props.selectedOperator] || {});
    }

    handleFieldSelect({key, keyPath}) {
        this.props.setField(key);
    }

    handleOperatorSelect({key, keyPath}) {
        this.props.setOperator(key);
    }

    buildMenuItems(fields, path = null) {
        if (!fields)
            return null;
        let prefix = path ? path.join(this.fieldSeparator) + this.fieldSeparator : '';

        return keys(fields).map(fieldKey => {
            let field = fields[fieldKey];
            if (field.widget == "!struct") {
                let subpath = (path ? path : []).concat(fieldKey);
                return <SubMenu 
                    key={prefix+fieldKey} 
                    title={<span>{field.label || last(fieldKey.split(this.fieldSeparator))} &nbsp;&nbsp;&nbsp;&nbsp;</span>}
                >
                    {this.buildMenuItems(field.subfields, subpath)}
                </SubMenu>
            } else {
                return <MenuItem key={prefix+fieldKey}>{field.label || last(fieldKey.split(this.fieldSeparator))}</MenuItem>;
            }
        });
    }

    buildMenuToggler(label, fullLabel, customLabel) {
        var toggler = 
            <Button 
                size="small" 
            >
                {customLabel ? customLabel : label} <span className="caret"/>
            </Button>;

        if (fullLabel && fullLabel != label) {
            toggler = <Tooltip
                    placement="top"
                    title={fullLabel}
                >
                {toggler}
                </Tooltip>;
        }

        return toggler;
    }

    render() {
        let selectedFieldsKeys = getFieldPath(this.props.selectedField, this.props.config);
        let selectedFieldPartsLabels = getFieldPathLabels(this.props.selectedField, this.props.config);
        let selectedFieldFullLabel = selectedFieldPartsLabels ? selectedFieldPartsLabels.join(this.fieldSeparatorDisplay) : null;

        let fieldMenuItems = this.buildMenuItems(this.fieldOptions);
        let fieldMenu = (
            <Menu 
                selectedKeys={selectedFieldsKeys}
                onClick={this.handleFieldSelect.bind(this)}
            >{fieldMenuItems}</Menu>
        );
        let fieldToggler = this.buildMenuToggler(this.curFieldOpts().label || this.props.config.settings.selectFieldLabel, 
            selectedFieldFullLabel, this.curFieldOpts().label2);

        let selectedOpKey = this.props.selectedOperator;
        let opMenuItems = this.buildMenuItems(this.operatorOptions);
        let opMenu = (
            <Menu 
                selectedKeys={[selectedOpKey]}
                onClick={this.handleOperatorSelect.bind(this)}
            >{opMenuItems}</Menu>
        );
        let opToggler = this.buildMenuToggler(this.curOpOpts().label || this.props.config.settings.selectOperatorLabel, null, null);

        return (
            <div className="rule">
                <div className="rule--header">
                    <Button 
                        type="danger"
                        icon="delete"
                        onClick={this.props.removeSelf}
                        size="small"
                    >
                        {this.props.config.settings.deleteLabel !== undefined ? this.props.config.settings.deleteLabel : "Delete"}
                    </Button>
                </div>
                <div className="rule--body">
                    <Row>
                        {size(this.fieldOptions) ? (
                            <Col key={"field"+"--for--"+(selectedFieldPartsLabels || []).join("_")+"__"+selectedOpKey} className="rule--field">
                                { this.props.config.settings.showLabels &&
                                    <label>{this.props.config.settings.fieldLabel || "Field"}</label>
                                }
                                <Dropdown 
                                    overlay={fieldMenu} 
                                    trigger={['click']}
                                >
                                    {fieldToggler}
                                </Dropdown>
                            </Col>
                        ) : null}
                        {size(this.operatorOptions) ? (
                            <Col key={"operator"+"--for--"+(selectedFieldPartsLabels || []).join("_")+"__"+selectedOpKey} className="rule--operator">
                                { this.props.config.settings.showLabels &&
                                    <label>{this.props.config.settings.operatorLabel || "Operator"}</label>
                                }
                                <Dropdown 
                                    overlay={opMenu} 
                                    trigger={['click']}
                                >
                                    {opToggler}
                                </Dropdown>
                            </Col>
                        ) : null}
                        {this.props.children}
                    </Row>
                </div>
            </div>
        );
    }

}
