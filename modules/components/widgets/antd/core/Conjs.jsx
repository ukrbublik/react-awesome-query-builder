import React, { PureComponent } from "react";
import map from "lodash/map";
import { Button, Radio } from "antd";
const ButtonGroup = Button.Group;


class ConjsButton extends PureComponent {
  onClick = (_e) => {
    const {setConjunction, item} = this.props;
    const conj = item.key;
    setConjunction(conj);
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


export default class ConjsButtons extends PureComponent {
  setNot = (e) => {
    const {setNot, not} = this.props;
    if (setNot)
      setNot(!not);
  }

  render() {
    const {readonly, disabled, not, conjunctionOptions, config, setConjunction, notLabel, showNot} = this.props;
    const conjsCount = Object.keys(conjunctionOptions).length;
    const lessThenTwo = disabled;
    const {forceShowConj, renderSize} = config.settings;
    const showConj = forceShowConj || conjsCount > 1 && !lessThenTwo;

    return (
      <ButtonGroup
        key="group-conjs-buttons"
        size={renderSize}
        disabled={disabled || readonly}
      >
        {showNot && (readonly ? not : true)
          && <Button
            key={"group-not"}
            onClick={this.setNot}
            type={not ? "primary" : null}
            disabled={readonly}
          >{notLabel}</Button>
        }
        {showConj && map(conjunctionOptions, (item, _index) => (readonly || disabled) && !item.checked ? null : (
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

// obsolete
/*
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
class ConjsRadios extends PureComponent {
  setConjunction = (e) => {
    const {setConjunction} = this.props;
    const conj = e.target.value;
    setConjunction(conj);
  }

  render() {
    const {readonly, disabled, selectedConjunction, conjunctionOptions, config} = this.props;
    return (
      <RadioGroup
        key="group-conjs-radios"
        disabled={disabled}
        value={selectedConjunction}
        size={config.settings.renderSize}
        onChange={this.setConjunction}
      >
        {map(conjunctionOptions, (item, _index) => readonly && !item.checked ? null : (
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
*/
