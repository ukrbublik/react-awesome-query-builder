import React, {Component, PropTypes} from 'react';
import {Col, Input} from "react-bootstrap";
import Datetime from 'react-datetime';
import moment from 'moment';
import 'react-datetime/css/react-datetime.css'

export default class Date extends Component {
    static propTypes = {
        setValue: PropTypes.func.isRequired,
        delta: PropTypes.number.isRequired,
        dateFormat: PropTypes.string,
        valueFormat: PropTypes.string,
        locale: PropTypes.string,
    };

    static defaultProps = {
        dateFormat: 'DD.MM.YYYY',
        valueFormat: 'YYYY-MM-DD',
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
        const {dateFormat, value, locale} = this.props;
        return (
            <Col>
                <label>Value</label>
                <Datetime
                    timeFormat={false}
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
