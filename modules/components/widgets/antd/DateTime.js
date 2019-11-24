import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from 'antd';
import moment from 'moment';


export default class DateTimeWidget extends PureComponent {
    static propTypes = {
        setValue: PropTypes.func.isRequired,
        timeFormat: PropTypes.string,
        dateFormat: PropTypes.string,
        valueFormat: PropTypes.string,
        value: PropTypes.string, //in valueFormat
        config: PropTypes.object.isRequired,
        field: PropTypes.string.isRequired,
        placeholder: PropTypes.string,
        use12Hours: PropTypes.bool,
        customProps: PropTypes.object,
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
        dateFormat: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        use12Hours: false,
    };

    handleChange = (_value) => {
        const {setValue, valueFormat} = this.props;
        const value = _value && _value.isValid() ? _value.format(valueFormat) : null;
        if (value || _value === null)
            setValue(value);
    }

    render() {
        const {placeholder, customProps, value, valueFormat, dateFormat, timeFormat, use12Hours, config} = this.props;
        const {renderSize} = config.settings;
        const dateValue = value ? moment(value, valueFormat) : null;
        const dateTimeFrmat = dateFormat + ' ' + timeFormat;

        return (
            <DatePicker
                key="widget-datetime"
                use12Hours={use12Hours}
                showTime={{ format: timeFormat }}
                placeholder={placeholder}
                size={renderSize}
                format={dateTimeFrmat}
                value={dateValue}
                onChange={this.handleChange}
                ref="datetime"
                {...customProps}
            />
        );
    }
}
