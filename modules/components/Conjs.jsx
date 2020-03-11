import React, { Component, PureComponent } from 'react';
import map from 'lodash/map';
import { Button, Radio } from 'antd';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const ButtonGroup = Button.Group;


class ConjsButton extends PureComponent {
  onClick = (e) => {
    const {item, setConjunction} = this.props;
    if (setConjunction)
      setConjunction(e, item.key);
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
  setNot = (e) => {
    const {setNot, not} = this.props;
    if (setNot)
      setNot(e, !not);
  }

  render() {
    const {readonly, disabled, not, conjunctionOptions, config, setConjunction} = this.props;
    return (
      <ButtonGroup
        key="group-conjs-buttons"
        size={config.settings.renderSize}
        disabled={disabled || readonly}
      >
        {config.settings.showNot && (readonly ? not : true) &&
          <Button
            key={"group-not"}
            onClick={this.setNot}
            type={not ? "primary" : null}
            disabled={readonly}
          >{config.settings.notLabel}</Button>
        }
        {map(conjunctionOptions, (item, index) => readonly && !item.checked ? null : (
          <ConjsButton
            key={item.id}
            item={item}
            disabled={disabled || readonly}
            setConjunction={setConjunction}
          />
        ))}
      </ButtonGroup>
    );
  }
}

// todo: obsolete
export class ConjsRadios extends PureComponent {
  render() {
    const {readonly, disabled, selectedConjunction, setConjunction, conjunctionOptions, config} = this.props;
    return (
      <RadioGroup
        key="group-conjs-radios"
        disabled={disabled}
        value={selectedConjunction}
        size={config.settings.renderSize}
        onChange={setConjunction}
      >
        {map(conjunctionOptions, (item, index) => readonly && !item.checked ? null : (
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
