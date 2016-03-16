import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import shouldPureComponentUpdate from 'react-pure-render/function';
import map from 'lodash/map';
import size from 'lodash/size';
import RuleContainer from './containers/RuleContainer';
import DropdownMenu, {NestedDropdownMenu} from 'react-dd-menu';
require('react-dd-menu/dist/react-dd-menu.css');

import {Row, Col, Button, Input, OverlayTrigger, Tooltip} from "react-bootstrap";

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
        setField: PropTypes.func.isRequired,
        setOperator: PropTypes.func.isRequired,
        removeSelf: PropTypes.func.isRequired,
        selectedField: PropTypes.string,
        selectedOperator: PropTypes.string,
        fieldSeparator: PropTypes.string,
        fieldSeparatorDisplay: PropTypes.string
    };

    shouldComponentUpdate = shouldPureComponentUpdate;

    constructor(props) {
        super(props);
        const curFieldOpts = props.fieldOptions[props.selectedField] || {};
        this.state = {
            isFieldOpen: false,
            curField: curFieldOpts.label || "Field",
        };
    }

    toggle() {
        this.setState({isFieldOpen: !this.state.isFieldOpen});
    }

    close() {
        this.setState({isFieldOpen: false});
    }

    handleFieldSelect1() {
        const node = ReactDOM.findDOMNode(this.refs.field);
        this.props.setField(node.value);
    }

    handleFieldSelect(label, value) {
        this.props.setField(value);
        this.setState({curField: label});
    }

    handleOperatorSelect() {
        // const node = ReactDOM.findDOMNode(this.refs.operator);
        this.props.setOperator(this.refs.operator.getValue());
    }

    getFieldMenu(fields, prefix) {
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
                return <NestedDropdownMenu key={prefix+field} toggle={<a href="#">{fields[field].label}</a>}
                                           direction="right" animate={false} delay={0}>
                    {this.getFieldMenu(child_fields, prefix + field)}
                </NestedDropdownMenu>
            } else {
                var short_label;
                if (fields[field].label.lastIndexOf(this.props.fieldSeparator) >= 0) {
                    short_label = fields[field].label.substring(fields[field].label.lastIndexOf(this.props.fieldSeparator) + this.props.fieldSeparator.length);
                } else {
                    short_label = fields[field].label;
                }
                return <li key={prefix+field}>
                    <button type="button"
                            onClick={this.handleFieldSelect.bind(this, fields[field].label, prefix+field)}>{short_label}</button>
                </li>
            }
        })
    }

    render() {
        var short_field;
        if (this.state.curField.lastIndexOf(this.props.fieldSeparator) >= 0) {
            short_field = this.state.curField.substring(this.state.curField.lastIndexOf(this.props.fieldSeparator) + this.props.fieldSeparator.length);
        } else {
            short_field = this.state.curField;
        }
        var toggle = <Button bsStyle="primary" onClick={this.toggle.bind(this)}>{short_field} <span className="caret"/></Button>;
        if (this.state.curField != short_field) {
            RegExp.quote = function (str) {
                return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
            };
            toggle = <OverlayTrigger placement="top"
                                     overlay={<Tooltip id="Field"><strong>{this.state.curField.replace(new RegExp(RegExp.quote(this.props.fieldSeparator), 'g'), this.props.fieldSeparatorDisplay)}</strong></Tooltip>}>{toggle}</OverlayTrigger>
        }
        let fieldMenuOptions = {
            isOpen: this.state.isFieldOpen,
            close: this.close.bind(this),
            toggle: toggle,
            nested: 'right',
            direction: 'right',
            align: 'left',
            animate: true
        };
        return (
            <div className="rule">
                <div className="rule--header">
                    <div className="rule--actions">
                        <button className="action action--DELETE" onClick={this.props.removeSelf}>Delete</button>
                    </div>
                </div>
                <Row className="rule--body">
                    {size(this.props.fieldOptions) ? (
                        <Col key="field" className="rule--field">
                            <label>Field</label>
                            <DropdownMenu {...fieldMenuOptions}>
                                { this.getFieldMenu(this.props.fieldOptions)}
                            </DropdownMenu>
                        </Col>
                    ) : null}
                    {size(this.props.operatorOptions) ? (
                        <Col key="operator" className="rule--operator">
                            <label>Operator</label>
                            <Input className="btn-success" type="select" ref="operator"
                                   value={this.props.selectedOperator} onChange={this.handleOperatorSelect.bind(this)}>
                                {map(this.props.operatorOptions, (label, value) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </Input>
                        </Col>
                    ) : null}
                    {this.props.children}
                </Row>
            </div>
        );
    }

    render1() {
        return (
            <div className="rule">
                <div className="rule--header">
                    <div className="rule--actions">
                        <button className="action action--DELETE" onClick={this.props.removeSelf}>Delete</button>
                    </div>
                </div>
                <div className="rule--body">
                    {size(this.props.fieldOptions) ? (
                        <div key="field" className="rule--field">
                            <label>Field</label>
                            <select ref="field" value={this.props.selectedField}
                                    onChange={this.handleFieldSelect.bind(this)}>
                                {map(this.props.fieldOptions, (label, value) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>
                    ) : null}
                    {size(this.props.operatorOptions) ? (
                        <div key="operator" className="rule--operator">
                            <label>Operator</label>
                            <select ref="operator" value={this.props.selectedOperator}
                                    onChange={this.handleOperatorSelect.bind(this)}>
                                {map(this.props.operatorOptions, (label, value) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>
                    ) : null}
                    {this.props.children}
                </div>
            </div>
        );
    }
}
