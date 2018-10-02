import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Input, Col } from 'antd';
import shallowCompare from 'react-addons-shallow-compare';

export default class TextWidget extends Component {
  constructor(props) {
    super(props);
    this.timer = null;
    this.setValueStorage = this.setValueStorage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      localValue:this.props.value,
      lastSetValueTime:performance.now()
    }
    this.textRef = null;
    this.setTextRef = element => {
      this.textRef = element;
    }
  }

  static propTypes = {
    setValue: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    config: PropTypes.object.isRequired,
    value: PropTypes.string,
    field: PropTypes.string.isRequired,
    customProps: PropTypes.object,
    minTimeOutSetValue: PropTypes.number,
  };

  static defaultProps = {
    minTimeOutSetValue:1000
  };
  // Set value at global state
  setValueStorage(value){
    this.props.setValue(value);
    Promise.resolve(1)
    .then(()=>{
      this.setState({lastSetValueTime:performance.now()})
      if(this.timer){
        clearTimeout(this.timer);
        this.timer = null;
      }
    });
  }


  shouldComponentUpdate = shallowCompare;

  handleChange(val) {
    const { value } = ReactDOM.findDOMNode(this.textRef);
    const { minTimeOutSetValue } = this.props;
    // Set value in local state
    this.setState({
      localValue:value
    });
    const { lastSetValueTime } = this.state;
    const nowTick = performance.now();
    // If the change in value is not too fast,
    // then save it in global state.
    if(nowTick-lastSetValueTime>minTimeOutSetValue){
      this.setValueStorage(value);
    }else{
      // If changes happen too fast,
      // then save the value in the global state, with a delay,
      // so that responsiveness does not suffer
      if(!this.timer){
        this.timer = setTimeout(
          ()=>{
            const { localValue:timeOutValue } = this.state;
            this.setValueStorage(timeOutValue);
          }, 
          minTimeOutSetValue-(nowTick-lastSetValueTime)
        );
      }
    }
  }

  render() {
    let customProps = this.props.customProps || {};

    return (
      <Col>
        <Input
          key="widget-text"
          size={this.props.config.settings.renderSize || "small"}
          ref={ this.setTextRef }
          type={"text"}
          value={this.state.localValue || null}
          placeholder={this.props.placeholder}
          onChange={this.handleChange}
          {...customProps}
        />
      </Col>
    );
  }
}