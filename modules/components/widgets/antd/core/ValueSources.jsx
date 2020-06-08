import React, { PureComponent } from "react";
import { Popover, Radio } from "antd";
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
import { EllipsisOutlined } from "@ant-design/icons";

export default class ValueSources extends PureComponent {
  onChange = (e) => {
    const {setValueSrc} = this.props;
    setValueSrc(e.target.value);
  };

  render() {
    const {config, valueSources, valueSrc, readonly, title} = this.props;

    let content = (
      <RadioGroup
        value={valueSrc || "value"}
        size={config.settings.renderSize}
        onChange={this.onChange}
        disabled={readonly}
      >
        {valueSources.map(([srcKey, info]) => (
          <RadioButton
            key={srcKey}
            value={srcKey}
          >{info.label}</RadioButton>
        ))}
      </RadioGroup>
    );

    return (
      <span>
        <Popover content={content} title={title}>
          <EllipsisOutlined />
        </Popover>
      </span>
    );
  }
}
