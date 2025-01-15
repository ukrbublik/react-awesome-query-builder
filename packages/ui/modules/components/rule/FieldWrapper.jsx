import React, { Component } from "react";
import Field from "./Field";
import {Col} from "../utils";
import FuncWidget from "./FuncWidget";
import {useOnPropsChanged} from "../../utils/reactUtils";


export default class FieldWrapper extends Component {
  constructor(props) {
    super(props);
    useOnPropsChanged(this);
    this.onPropsChanged(props);
  }

  onPropsChanged(nextProps) {
    const prevProps = this.props;
    const configChanged = !this.ValueSources || prevProps?.config !== nextProps?.config;
    const keysForMeta = ["config"];
    const needUpdateMeta = !this.meta || keysForMeta.map(k => (nextProps[k] !== prevProps[k])).filter(ch => ch).length > 0;

    if (needUpdateMeta) {
      this.meta = this.getMeta(nextProps);
    }
    if (configChanged) {
      const { config } = nextProps;
      const { renderValueSources } = config.settings;
      this.ValueSources = (pr) => renderValueSources(pr, config.ctx);
    }
  }

  getMeta({
    config
  }) {
    const {valueSourcesInfo, fieldSources} = config.settings;
    const fieldSourcesOptions = fieldSources.map((srcKey) => [
      srcKey,
      {
        label: valueSourcesInfo[srcKey]?.label,
      },
    ]);
    return {
      fieldSourcesOptions,
    };
  }

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
    if (!this.meta) return null;
    const { config, readonly, selectedFieldSrc, setFieldSrc, id } = this.props;
    const { fieldSourcesOptions } = this.meta;
    const { settings } = config;
    const ValueSources = this.ValueSources;

    const sourceLabel = settings.showLabels ? (
      <label className="rule--label">&nbsp;</label>
    ) : null;

    return (
      fieldSourcesOptions.length > 1 && !readonly && (
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
