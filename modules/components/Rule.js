import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import shallowCompare from 'react-addons-shallow-compare';
import RuleContainer from './containers/RuleContainer';
import { Row, Col, Layout, Menu, Dropdown, Icon, Tooltip, Button } from 'antd';
const { Header, Footer, Sider, Content } = Layout;
const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;
const DropdownButton = Dropdown.Button;
import {} from "../utils/index";
import map from 'lodash/map';
import size from 'lodash/size';
import keys from 'lodash/keys';
import pickBy from 'lodash/pickBy';
import omitBy from 'lodash/omitBy';
import mapKeys from 'lodash/mapKeys';

var stringify = require('json-stringify-safe');

@RuleContainer
export default class Rule extends Component {
    static propTypes = {
        fieldOptions: PropTypes.object.isRequired,
        operatorOptions: PropTypes.object.isRequired,
        defaultFieldOptions: PropTypes.object.isRequired,
        defaultOperatorOptions: PropTypes.object.isRequired,
        setField: PropTypes.func.isRequired,
        setOperator: PropTypes.func.isRequired,
        removeSelf: PropTypes.func.isRequired,
        selectedField: PropTypes.string,
        selectedOperator: PropTypes.string,
        fieldSeparator: PropTypes.string,
        fieldSeparatorDisplay: PropTypes.string,
        config: PropTypes.object.isRequired,
    };

    shouldComponentUpdate = shallowCompare;

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    curFieldOpts() {
        return Object.assign({label: "Field"}, this.props.defaultFieldOptions, this.props.fieldOptions[this.props.selectedField] || {});
    }

    curOpOpts() {
        return Object.assign({label: "Operator"}, this.props.defaultOperatorOptions, this.props.operatorOptions[this.props.selectedOperator] || {});
    }

    handleFieldSelect({key, keyPath}) {
        this.props.setField(key);
    }

    handleOperatorSelect({key, keyPath}) {
        this.props.setOperator(key);
    }

    buildMenuItems(fields, prefix) {
        if (prefix === undefined) {
            prefix = '';
        } else {
            prefix = prefix + this.props.fieldSeparator;
        }
        const direct_fields = omitBy(fields, (value, key)=> key.indexOf(this.props.fieldSeparator) > -1);

        return keys(direct_fields).map(field => {
            if (fields[field].widget == "submenu") {
                var child_fields = pickBy(fields, (value, key)=> key.startsWith(field + this.props.fieldSeparator));
                child_fields = mapKeys(child_fields, (value, key) => key.substring(field.length + this.props.fieldSeparator.length));
                return <SubMenu 
                    key={prefix+field} 
                    title={fields[field].label+'   -'}
                >
                    {this.buildMenuItems(child_fields, prefix + field)}
                </SubMenu>
            } else {
                var short_label;
                const label = fields[field].label || fields[field];
                if (label.lastIndexOf(this.props.fieldSeparator) >= 0) {
                    short_label = label.substring(label.lastIndexOf(this.props.fieldSeparator) + this.props.fieldSeparator.length);
                } else {
                    short_label = label;
                }
                return <MenuItem key={prefix+field}>{short_label}</MenuItem>
            }
        })
    }

    buildMenuToggler(label, label2) {
        var short_field;
        if (label2) {
            short_field = label2;
        } else if (label.lastIndexOf(this.props.fieldSeparator) >= 0) {
            short_field = label.substring(label.lastIndexOf(this.props.fieldSeparator) 
                + this.props.fieldSeparator.length);
        } else {
            short_field = label;
        }
        var toggler = 
            <Button 
                size="small" 
            >
                {short_field} <span className="caret"/>
            </Button>;
        let curFieldTooltip = label.replace(new RegExp(RegExp.quote(this.props.fieldSeparator), 'g'), this.props.fieldSeparatorDisplay);
        if (label != short_field) {
            toggler = <Tooltip
                    placement="top"
                    title={curFieldTooltip}
                >
                {toggler}
                </Tooltip>;
        }
        return toggler;
    }

    render() {
        return this.renderNew();
    }

    renderNew() {
        let selectedFields = this.props.selectedField
            .split(this.props.fieldSeparator)
            .map((curr, ind, arr) => arr.slice(0, ind+1))
            .map((parts) => parts.join(this.props.fieldSeparator));

        let fieldMenuItems = this.buildMenuItems(this.props.fieldOptions);
        let fieldMenu = (
            <Menu 
                selectedKeys={selectedFields}
                onClick={this.handleFieldSelect.bind(this)}
            >{fieldMenuItems}</Menu>
        );
        let fieldToggler = this.buildMenuToggler(this.curFieldOpts().label, this.curFieldOpts().label2);
        let opMenuItems = this.buildMenuItems(this.props.operatorOptions);
        let opMenu = (
            <Menu 
                onClick={this.handleOperatorSelect.bind(this)}
            >{opMenuItems}</Menu>
        );
        let opToggler = this.buildMenuToggler(this.curOpOpts().label, null);

        return (
            <Layout className="rule">
                <Content className="rule--body">
                    <Row>
                        {size(this.props.fieldOptions) ? (
                            <Col key="field" className="rule--field">
                                { this.props.config.settings.showLabels &&
                                    <label>{this.curFieldOpts().label || "Field"}</label>
                                }
                                <Dropdown 
                                    overlay={fieldMenu} 
                                    trigger={['click']}
                                >
                                    {fieldToggler}
                                </Dropdown>
                            </Col>
                        ) : null}
                        {size(this.props.operatorOptions) ? (
                            <Col key="operator" className="rule--operator">
                                { this.props.config.settings.showLabels &&
                                    <label>{this.curOpOpts().label || "Operator"}</label>
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
                </Content>
                <Sider className="rule--header">
                    <Button 
                        type={"danger"}
                        onClick={this.props.removeSelf}
                    >
                        {this.props.config.settings.deleteLabel || "Delete"}
                    </Button>
                </Sider>
            </Layout>
        );
    }

}
