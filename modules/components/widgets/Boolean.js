import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Switch } from 'antd';
import shallowCompare from 'react-addons-shallow-compare';

export default class BooleanWidget extends Component {
    static propTypes = {
        setValue: PropTypes.func.isRequired,
        labelYes: PropTypes.string,
        labelNo: PropTypes.string,
        value: PropTypes.bool,
        config: PropTypes.object.isRequired,
        field: PropTypes.string.isRequired,
        customProps: PropTypes.object,
    }

    shouldComponentUpdate = shallowCompare;

    handleChange = (val) => {
        this.props.setValue(val);
    }

    constructor(props) {
        super(props);
    }

    static defaultProps = {
        labelYes: null,
        labelNo: null,
    }

    render() {
        let customProps = this.props.customProps || {};

        return (
            <Switch
                ref="switch"
                checkedChildren={this.props.labelYes || null}
                unCheckedChildren={this.props.labelNo || null}
                checked={this.props.value || null}
                onChange={this.handleChange}
                {...customProps}
            />
        );
    }
}
