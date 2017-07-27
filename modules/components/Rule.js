import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import shallowCompare from 'react-addons-shallow-compare';
import map from 'lodash/map';
import size from 'lodash/size';
import RuleContainer from './containers/RuleContainer';
import DropdownMenu, {NestedDropdownMenu} from 'react-dd-menu';
require('react-dd-menu/dist/react-dd-menu.css');
import {} from "../utils/index";

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
            isFieldOpen: false,
            isOpOpen: false,
        };
    }

    curFieldOpts() {
        return Object.assign({label: "Field"}, this.props.defaultFieldOptions, this.props.fieldOptions[this.props.selectedField] || {});
    }

    curOpOpts() {
        return Object.assign({label: "Operator"}, this.props.defaultOperatorOptions, this.props.operatorOptions[this.props.selectedOperator] || {});
    }

    toggleFieldMenu() {
        this.setState({isFieldOpen: !this.state.isFieldOpen});
    }

    closeFieldMenu() {
        this.setState({isFieldOpen: false});
    }

    toggleOpMenu() {
        this.setState({isOpOpen: !this.state.isOpOpen});
    }

    closeOpMenu() {
        this.setState({isOpOpen: false});
    }

    handleFieldSelect(e, label, value) {
        if (e) {
            value = this.refs.field.value;
            let fieldOpts = this.props.fieldOptions[value];
            label = fieldOpts.label;
        }

        this.props.setField(value);
    }

    handleOperatorSelect(e, label, value) {
        if (e) {
            value = this.refs.operator.value;
            let opOpts = this.props.operatorOptions[value];
            label = opOpts.label;
        }

        this.props.setOperator(value);
    }

    buildMenu(fields, handleSelect, prefix) {
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
                    {this.buildMenu(child_fields, handleSelect, prefix + field)}
                </NestedDropdownMenu>
            } else {
                var short_label;
                const label = fields[field].label || fields[field];
                if (label.lastIndexOf(this.props.fieldSeparator) >= 0) {
                    short_label = label.substring(label.lastIndexOf(this.props.fieldSeparator) + this.props.fieldSeparator.length);
                } else {
                    short_label = label;
                }
                return <li key={prefix+field}>
                    <button type="button"
                            onClick={handleSelect.bind(this, null, fields[field].label, prefix+field)}>{short_label}</button>
                </li>
            }
        })
    }

    buildMenuToggler(curField, toggleFn) {
        var short_field;
        if (curField.lastIndexOf(this.props.fieldSeparator) >= 0) {
            short_field = curField.substring(curField.lastIndexOf(this.props.fieldSeparator) 
                + this.props.fieldSeparator.length);
        } else {
            short_field = curField;
        }
        var toggler = 
            <Button bsStyle="primary" onClick={toggleFn.bind(this)}>{short_field} <span className="caret"/></Button>;
        if (curField != short_field) {
            toggler = 
                <OverlayTrigger placement="top"
                    overlay={<Tooltip id="Field"><strong>{
                        curField.replace(new RegExp(RegExp.quote(this.props.fieldSeparator), 'g'), 
                            this.props.fieldSeparatorDisplay)
                    }</strong></Tooltip>}
                >{toggler}</OverlayTrigger>
        }
        return toggler;
    }

    render() {
        return this.renderNew();
    }

    renderNew() {
        let fieldMenuOptions = {
            isOpen: this.state.isFieldOpen,
            close: this.closeFieldMenu.bind(this),
            toggle: this.buildMenuToggler(this.curFieldOpts().label, this.toggleFieldMenu),
            nested: 'right',
            direction: 'right',
            align: 'left',
            animate: true
        };

        let operatorMenuOptions = {
            isOpen: this.state.isOpOpen,
            close: this.closeOpMenu.bind(this),
            toggle: this.buildMenuToggler(this.curOpOpts().label, this.toggleOpMenu),
            nested: 'right',
            direction: 'right',
            align: 'left',
            animate: true
        };

        return (
            <div className="rule">
                <div className="rule--header">
                    <div className="rule--actions">
                        <button 
                            className="action action--DELETE" 
                            onClick={this.props.removeSelf}
                        >
                            {this.props.config.settings.deleteLabel || "Delete"}
                        </button>
                    </div>
                </div>
                <Row className="rule--body">
                    {size(this.props.fieldOptions) ? (
                        <Col key="field" className="rule--field">
                            { this.props.config.settings.showLabels &&
                                <label>{this.curFieldOpts().label || "Field"}</label>
                            }
                            <DropdownMenu {...fieldMenuOptions}>
                                { this.buildMenu(this.props.fieldOptions, this.handleFieldSelect)}
                            </DropdownMenu>
                        </Col>
                    ) : null}
                    {size(this.props.operatorOptions) ? (
                        <Col key="operator" className="rule--operator">
                            { this.props.config.settings.showLabels &&
                                <label>{this.curOpOpts().label || "Operator"}</label>
                            }
                            <DropdownMenu {...operatorMenuOptions}>
                                { this.buildMenu(this.props.operatorOptions, this.handleOperatorSelect)}
                            </DropdownMenu>
                        </Col>
                    ) : null}
                    {this.props.children}
                </Row>
            </div>
        );
    }

    /*
    renderOld() {
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
                                    <option key={value} value={value}>{label.label}</option>
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
                                    <option key={value} value={value}>{label.label}</option>
                                ))}
                            </select>
                        </div>
                    ) : null}
                    {this.props.children}
                </div>
            </div>
        );
    }
    */
}
