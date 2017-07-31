import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Col, Input} from "react-bootstrap";
import RadioGroup from "react-radio-group";

export default class BooleanWidget extends Component {
    static propTypes = {
        setValue: PropTypes.func.isRequired,
        delta: PropTypes.number.isRequired
    };

    handleChange() {
        this.props.setValue(this.refs.widget.getValue());
    }

    render() {
        const {value, delta, id} = this.props;
        return (
            <Col>
                <RadioGroup name={id} selectedValue={value}  ref="widget" onChange={this.handleChange.bind(this)}>
                    {Radio => (
                        <div>
                            <Input autoFocus={delta === 0} type="radio"/> Yes
                            <Input autoFocus={delta === 0} type="radio"/> No
                        </div>
                    )}
                </RadioGroup>
            </Col>
        );
    }
}
