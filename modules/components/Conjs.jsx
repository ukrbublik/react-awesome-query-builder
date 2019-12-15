import React, { Component, PureComponent } from 'react';
import map from 'lodash/map';
import { Button, Radio } from 'antd';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const ButtonGroup = Button.Group;


class ConjsButton extends PureComponent {
  onClick = (e) => {
    const {item} = this.props;
    this.props.setConjunction(e, item.key);
  }

  render() {
    const {disabled, item} = this.props;
    return (
      <Button
        disabled={disabled}
        type={item.checked ? "primary" : null}
        onClick={this.onClick}
      >{item.label}</Button>
    );
  }
}


export class ConjsButtons extends PureComponent {
  render() {
    const {disabled, not, setNot, conjunctionOptions, config, setConjunction} = this.props;
    return (
      <ButtonGroup
        key="group-conjs-buttons"
        size={config.settings.renderSize}
        disabled={disabled}
      >
        {config.settings.showNot &&
          <Button
            key={"group-not"}
            onClick={(ev) => setNot(ev, !this.props.not)}
            type={not ? "primary" : null}
          >{config.settings.notLabel}</Button>
        }
        {map(conjunctionOptions, (item, index) => (
          <ConjsButton
            key={item.id}
            item={item}
            disabled={disabled}
            setConjunction={setConjunction}
          />
        ))}
      </ButtonGroup>
    );
  }
}


export class ConjsRadios extends PureComponent {
  render() {
    const {disabled, selectedConjunction, setConjunction, conjunctionOptions, config} = this.props;
    return (
      <RadioGroup
        key="group-conjs-radios"
        disabled={disabled}
        value={selectedConjunction}
        size={config.settings.renderSize}
        onChange={setConjunction}
      >
        {map(conjunctionOptions, (item, index) => (
          <RadioButton
            key={item.id}
            value={item.key}
          //checked={item.checked}
          >{item.label}</RadioButton>
        ))}
      </RadioGroup>
    );
  }
}
