import React, {Component, PropTypes} from 'react';
import {Col, Input} from "react-bootstrap";
import Datetime from 'react-datetime';
import moment from 'moment';
import 'react-datetime/css/react-datetime.css'

export default class TimeWidget extends Component {
    static propTypes = {
        setValue: PropTypes.func.isRequired,
        delta: PropTypes.number.isRequired,
        timeFormat: PropTypes.string,
        valueFormat: PropTypes.string,
        locale: PropTypes.string,
    };

    constructor(props) {
        super(props);

        const {valueFormat, value, setValue} = props;
        let mValue = value ? moment(value, valueFormat) : null;
        if (mValue && !mValue.isValid()) {
            setValue(null);
        }
    }

    static defaultProps = {
        timeFormat: 'HH:mm',
        valueFormat: 'HH:mm:ss',
        locale: 'ru',
    };
    

    handleChange(_value) {
        const {setValue, valueFormat} = this.props;
        const value = _value instanceof moment && _value.isValid() ? _value.format(valueFormat) : null;
        if (value)
            setValue(value);
    }

    render() {
        const {timeFormat, valueFormat, value, locale} = this.props;
        let dateValue = value ? moment(value, valueFormat) : null;
        return (
            <Col xs={5}>
                { this.props.config.settings.showLabels &&
                    <label>{this.props.label || this.props.config.settings.valueLabel || "Value"}</label>
                }
                <Datetime
                    timeFormat={timeFormat}
                    dateFormat={false}
                    locale={locale}
                    value={dateValue}
                    onChange={this.handleChange.bind(this)}
                    ref="datetime"
                />
            </Col>
        );
    }
}
