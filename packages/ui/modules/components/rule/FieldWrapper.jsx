import React, { PureComponent } from "react";
import Field from "./Field";
import {Col} from "../utils";
import FuncWidget from "./FuncWidget";


export default class FieldWrapper extends PureComponent {
  render() {
    const {classname, canSelectFieldSource} = this.props;
    const fieldSources = canSelectFieldSource && this.renderFieldSources();
    const field = this.renderField();
    if (!canSelectFieldSource) {
      return field;
    } else {
      return (
        <Col className={"rule--field-wrapper"}>
          {fieldSources}
          {field}
        </Col>
      );
    }
  }

  renderField = () => {
    const {
      config, classname, selectedField, selectedFieldSrc, selectedFieldType, 
      setField, setFuncValue, parentField, readonly, id, groupId,
      fieldError, valueError,
    } = this.props;
    const supportedFieldSrcs = ["func", "field"];
    if (!supportedFieldSrcs.includes(selectedFieldSrc)) {
      return "?";
    }
    const field = selectedFieldSrc === "func" ? (
      <FuncWidget
        isLHS={true}
        config={config}
        value={selectedField}
        fieldSrc={selectedFieldSrc}
        fieldType={selectedFieldType}
        fieldError={fieldError}
        valueError={valueError}
        parentField={parentField}
        setValue={setField}
        setFuncValue={setFuncValue}
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
        selectedFieldType={selectedFieldType}
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
    const label = config.settings.showLabels && selectedFieldSrc !== "func" && <label className="rule--label">{fieldLabel}</label>;
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
      renderValueSources,
    } = settings;
    const fieldSourcesOptions = fieldSources.map((srcKey) => [
      srcKey,
      {
        label: valueSourcesInfo[srcKey].label,
      },
    ]);
    const ValueSources = (pr) => renderValueSources(pr, config.ctx);

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
            title={settings.fieldSourcesPopupTitle}
          />
        </div>
      )
    );
  };
}
