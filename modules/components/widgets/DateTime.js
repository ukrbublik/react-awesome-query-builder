import React, {Component, PropTypes} from 'react';
import {Col, Input} from "react-bootstrap";
import Datetime from 'react-datetime';
import moment from 'moment';
import 'react-datetime/css/react-datetime.css'

export default class DateTime extends Component {
    static propTypes = {
        setValue: PropTypes.func.isRequired,
        delta: PropTypes.number.isRequired,
        timeFormat: PropTypes.string,
        dateFormat: PropTypes.string,
        valueFormat: PropTypes.string,
        locale: PropTypes.string,
    };

    static defaultProps = {
        timeFormat: 'HH:mm',
        dateFormat: 'DD.MM.YYYY',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        locale: 'ru',
    };

    handleChange(value) {
        const {setValue, valueFormat} = this.props;
        value = moment(value).format(valueFormat);
        setValue(value);
    }

    handleClick() {
        console.log("In Date:handleClick");
    }

    render() {
        const {timeFormat, dateFormat, value, locale} = this.props;
        return (
            <Col xs={3}>
                <label>Value</label>
                <Datetime
                    timeFormat={timeFormat}
                    dateFormat={dateFormat}
                    locale={locale}
                    value={value}
                    onChange={this.handleChange.bind(this)}
                    ref="datetime"
                />
            </Col>
        );
    }
}
