import React, { PureComponent } from "react";
import Field from "./Field";
import { Col } from "../utils";
import FuncWidget from "./FuncWidget";

export default class FieldWrapper extends PureComponent {
  renderFieldSources = () => {
    const { config, readonly, selectedFieldSrc, setFieldSrc, id } = this.props;
    const { settings } = config;
    const {
      fieldSources,
      valueSourcesInfo,
      renderValueSources: ValueSources,
    } = settings;
    const fieldSourcesOptions = fieldSources.map((srcKey) => [
      srcKey,
      {
        label: valueSourcesInfo[srcKey].label,
      },
    ]);

    const sourceLabel = settings.showLabels ? (
      <label className="rule--label">&nbsp;</label>
    ) : null;

    return (
      fieldSources.length > 1 &&
      !readonly && (
        <div key={"fieldsrc"} className="rule--fieldsrc">
          {sourceLabel}
          <ValueSources
            key={"fieldsrc-" + id}
            valueSources={fieldSourcesOptions}
            valueSrc={selectedFieldSrc}
            config={config}
            setValueSrc={setFieldSrc}
            readonly={readonly}
            title={settings.valueSourcesPopupTitle}
          />
        </div>
      )
    );
  };

  render() {
    const {
      config,
      selectedField,
      selectedFieldSrc,
      setField,
      parentField,
      readonly,
      id,
      groupId,
    } = this.props;
    const fieldSources = this.renderFieldSources({
      valueSources: this.props.config.settings.fieldSources,
    });
    const field =
      this.props.selectedFieldSrc === "func" ? (
        <FuncWidget
          config={config}
          value={selectedField}
          parentField={parentField}
          setValue={setField}
          readonly={readonly}
          id={id}
          groupId={groupId}
          key={"field-" + id}
        />
      ) : (
        <Field
          config={config}
          selectedField={selectedField}
          selectedFieldSrc={selectedFieldSrc}
          parentField={parentField}
          setField={setField}
          customProps={config.settings.customFieldSelectProps}
          readonly={readonly}
          id={id}
          groupId={groupId}
          key={"field-" + id}
        />
      );
    return (
      <Col className={`rule--widget`} key={"widget-col"}>
        {[fieldSources, field]}
      </Col>
    );
  }
}
