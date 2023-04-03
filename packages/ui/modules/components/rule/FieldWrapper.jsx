import React, { PureComponent } from "react";
import Field from "./Field";
import {Col} from "../utils";
import FuncWidget from "./FuncWidget";


export default class FieldWrapper extends PureComponent {
  render() {
    const {classname} = this.props;
    const fieldSources = this.renderFieldSources();
    const field = this.renderField();
    return (
      <Col className={"rule--field-wrapper"}>
        {fieldSources}
        {field}
      </Col>
    );
  }

  renderField = () => {
    const {config, classname, selectedField, selectedFieldSrc, setField, parentField, readonly, id, groupId} = this.props;
    const field = selectedFieldSrc === "func" ? (
      <FuncWidget
        config={config}
        value={selectedField}
        parentField={parentField}
        setValue={setField}
        readonly={readonly}
        id={id}
        groupId={groupId}
        key={"field-func-" + id}
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
    const fieldLabel = selectedFieldSrc === "func" ? config.settings.funcLabel : config.settings.fieldLabel;
    const label = config.settings.showLabels && <label className="rule--label">{fieldLabel}</label>;
    return (
      <div key={selectedFieldSrc} className={classname}>
        {label}
        {field}
      </div>
    );
  };

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
      fieldSources.length > 1 && !readonly && (
        <div key={"fieldsrc"} className={"rule--fieldsrc"}>
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
}
