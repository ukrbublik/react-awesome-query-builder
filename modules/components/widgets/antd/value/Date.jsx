import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from 'antd';
import moment from 'moment';


export default class DateWidget extends PureComponent {
    static propTypes = {
        setValue: PropTypes.func.isRequired,
        value: PropTypes.string, //in valueFormat
        field: PropTypes.string.isRequired,
        config: PropTypes.object.isRequired,
        placeholder: PropTypes.string,
        customProps: PropTypes.object,
        readonly: PropTypes.bool,
        // from fieldSettings:
        dateFormat: PropTypes.string,
        valueFormat: PropTypes.string,
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
        dateFormat: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
    };

    handleChange = (_value) => {
        const {setValue, valueFormat} = this.props;
        const value = _value && _value.isValid() ? _value.format(valueFormat) : undefined;
        if (value || _value === null)
            setValue(value);
    }

    render() {
        const {placeholder, customProps, value, valueFormat, dateFormat, config, readonly} = this.props;
        const {renderSize} = config.settings;
        const dateValue = value ? moment(value, valueFormat) : null;

        return (
            <DatePicker
                disabled={readonly}
                key="widget-date"
                placeholder={placeholder}
                size={renderSize}
                format={dateFormat}
                value={dateValue}
                onChange={this.handleChange}
                {...customProps}
            />
        );
    }
}
