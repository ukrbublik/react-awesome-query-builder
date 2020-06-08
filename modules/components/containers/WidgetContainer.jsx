import React, { Component, PureComponent } from "react";
import PropTypes from "prop-types";
import range from "lodash/range";
import {
  getFieldConfig, getValueLabel, getOperatorConfig, getValueSourcesForFieldOp,
  getWidgetForFieldOp, getFieldWidgetConfig, getWidgetsForFieldOp
} from "../../utils/configUtils";
import {getTitleInListValues, defaultValue, useOnPropsChanged} from "../../utils/stuff";
import pick from "lodash/pick";
import Immutable from "immutable";

const funcArgDummyOpDef = {cardinality: 1};

export default (Widget) => {
  return class WidgetContainer extends PureComponent {
        static propTypes = {
          config: PropTypes.object.isRequired,
          value: PropTypes.any, //instanceOf(Immutable.List)
          valueSrc: PropTypes.any, //instanceOf(Immutable.List)
          valueError: PropTypes.any,
          field: PropTypes.string,
          operator: PropTypes.string,
          readonly: PropTypes.bool,
          //actions
          setValue: PropTypes.func,
          setValueSrc: PropTypes.func,
          // for isFuncArg
          isFuncArg: PropTypes.bool,
          fieldFunc: PropTypes.string,
          fieldArg: PropTypes.string,
          leftField: PropTypes.string,
        };

        constructor(props) {
          super(props);
          useOnPropsChanged(this);

          this.onPropsChanged(props);
        }

        onPropsChanged(nextProps) {
          const prevProps = this.props;
          const keysForMeta = ["config", "field", "fieldFunc", "fieldArg", "leftField", "operator", "valueSrc", "isFuncArg"];
          const needUpdateMeta = !this.meta 
                || keysForMeta
                  .map(k => (
                    nextProps[k] !== prevProps[k] 
                        //tip: for isFuncArg we need to wrap value in Imm list
                        || k == "isFuncArg" && nextProps["isFuncArg"] && nextProps["value"] !== prevProps["value"])
                  )
                  .filter(ch => ch).length > 0;

          if (needUpdateMeta) {
            this.meta = this.getMeta(nextProps);
          }
        }

        _setValue = (isSpecialRange, delta, widgetType, value, __isInternal) => {
          if (isSpecialRange && Array.isArray(value)) {
            const oldRange = [this.props.value.get(0), this.props.value.get(1)];
            if (oldRange[0] != value[0])
              this.props.setValue(0, value[0], widgetType, __isInternal);
            if (oldRange[1] != value[1])
              this.props.setValue(1, value[1], widgetType, __isInternal);
          } else {
            this.props.setValue(delta, value, widgetType, __isInternal);
          }
        }

        _onChangeValueSrc = (delta, srcKey) => {
          this.props.setValueSrc(delta, srcKey);
        }

        getMeta({config, field: simpleField, fieldFunc, fieldArg, operator, valueSrc: valueSrcs, value: values, isFuncArg, leftField}) {
          const field = isFuncArg ? {func: fieldFunc, arg: fieldArg} : simpleField;
          let _valueSrcs = valueSrcs;
          let _values = values;
          if (isFuncArg) {
            _valueSrcs = Immutable.List([valueSrcs]);
            _values = Immutable.List([values]);
          }

          const fieldDefinition = getFieldConfig(field, config);
          const defaultWidget = getWidgetForFieldOp(config, field, operator);
          const _widgets = getWidgetsForFieldOp(config, field, operator);
          const operatorDefinition = isFuncArg ? funcArgDummyOpDef : getOperatorConfig(config, operator, field);
          if (fieldDefinition == null || operatorDefinition == null) {
            return null;
          }
          const isSpecialRange = operatorDefinition.isSpecialRange;
          const isSpecialRangeForSrcField = isSpecialRange && (_valueSrcs.get(0) == "field" || _valueSrcs.get(1) == "field");
          const isTrueSpecialRange = isSpecialRange && !isSpecialRangeForSrcField;
          const cardinality = isTrueSpecialRange ? 1 : defaultValue(operatorDefinition.cardinality, 1);
          if (cardinality === 0) {
            return null;
          }

          const valueSources = getValueSourcesForFieldOp(config, field, operator, fieldDefinition, isFuncArg ? leftField : null);

          const widgets = range(0, cardinality).map(delta => {
            const valueSrc = _valueSrcs.get(delta) || null;
            let widget = getWidgetForFieldOp(config, field, operator, valueSrc);
            let widgetDefinition = getFieldWidgetConfig(config, field, operator, widget, valueSrc);
            if (isSpecialRangeForSrcField) {
              widget = widgetDefinition.singleWidget;
              widgetDefinition = getFieldWidgetConfig(config, field, operator, widget, valueSrc);
            }
            const widgetType = widgetDefinition.type;
            const valueLabel = getValueLabel(config, field, operator, delta, valueSrc, isTrueSpecialRange);
            const widgetValueLabel = getValueLabel(config, field, operator, delta, null, isTrueSpecialRange);
            const sepText = operatorDefinition.textSeparators ? operatorDefinition.textSeparators[delta] : null;
            const setValueSrcHandler = this._onChangeValueSrc.bind(this, delta);

            let valueLabels = null;
            let textSeparators = null;
            if (isSpecialRange) {
              valueLabels = [
                getValueLabel(config, field, operator, 0),
                getValueLabel(config, field, operator, 1)
              ];
              valueLabels = {
                placeholder: [ valueLabels[0].placeholder, valueLabels[1].placeholder ],
                label: [ valueLabels[0].label, valueLabels[1].label ],
              };
              textSeparators = operatorDefinition.textSeparators;
            }

            const setValueHandler = this._setValue.bind(this, isSpecialRange, delta, widgetType);

            return {
              valueSrc,
              valueLabel,
              widget,
              sepText,
              setValueSrcHandler,
              widgetDefinition,
              widgetValueLabel,
              valueLabels,
              textSeparators,
              setValueHandler
            };
          });
            
          return {
            defaultWidget,
            fieldDefinition,
            operatorDefinition,
            isSpecialRange: isTrueSpecialRange,
            cardinality,
            valueSources,
            widgets,
            _values, //correct for isFuncArg
            _field: field, //correct for isFuncArg
          };
        }

        render() {
          const {config, isFuncArg, leftField, operator, value: values, valueError, readonly} = this.props;
          const meta = this.meta;
          if (!meta)
            return null;
          const {
            defaultWidget, cardinality, valueSources, widgets, _values, _field
          } = meta;
          const value = isFuncArg ? _values : values;
          const field = isFuncArg ? leftField : _field;
          const {settings} = config;
          const {valueSourcesInfo, renderValueSources: ValueSources} = settings;
          const valueSourcesOptions = valueSources.map(srcKey => [srcKey, {
            label: valueSourcesInfo[srcKey].label
          }]);

          return (
            <Widget name={defaultWidget} config={config}>
              {range(0, cardinality).map(delta => {
                const {valueSrc, valueLabel, sepText, setValueSrcHandler} = widgets[delta];

                //if (!valueSrc && valueSources.length == 1) {
                //    this.props.setValueSrc(delta, valueSources[0]);
                //}

                const sepLabel = settings.showLabels
                  ? <label>&nbsp;</label>
                  : null;
                const sourceLabel = settings.showLabels
                  ? <label>&nbsp;</label>
                  : null;
                const widgetLabel = settings.showLabels
                  ? <label>{valueLabel.label}</label>
                  : null;

                const sep = sepText
                            && <div key={"widget-separators-"+delta} className="widget--sep" >
                              {sepLabel}
                              <span>{sepText}</span>
                            </div>;

                const sources = valueSources.length > 1 && !readonly
                            && <div key={"valuesrc-"+field+"-"+delta} className="widget--valuesrc">
                              {sourceLabel}
                              <ValueSources
                                key={"valuesrc-"+delta}
                                delta={delta}
                                valueSources={valueSourcesOptions}
                                valueSrc={valueSrc}
                                config={config}
                                field={field}
                                operator={operator}
                                setValueSrc={setValueSrcHandler}
                                readonly={readonly}
                                title={settings.valueSourcesPopupTitle}
                              />
                            </div>;

                const widgetCmp 
                            = <div key={"widget-"+field+"-"+delta} className="widget--widget">
                              {valueSrc == "func" ? null : widgetLabel}
                              <WidgetFactory
                                valueSrc={valueSrc}
                                delta={delta}
                                value={value}
                                valueError={valueError}
                                isFuncArg={isFuncArg}
                                {...pick(meta, ["isSpecialRange", "fieldDefinition"])}
                                {...pick(widgets[delta], ["widget", "widgetDefinition", "widgetValueLabel", "valueLabels", "textSeparators", "setValueHandler"])}
                                config={config}
                                field={field}
                                operator={operator}
                                readonly={readonly}
                              />
                            </div>;

                return [
                  sep,
                  sources,
                  widgetCmp,
                ];
              })}
            </Widget>
          );
        }
  };
};


const WidgetFactory = ({
  delta, isFuncArg, valueSrc,
  value: immValue, valueError: immValueError,
  isSpecialRange, fieldDefinition,
  widget, widgetDefinition, widgetValueLabel, valueLabels, textSeparators, setValueHandler,
  config, field, operator, readonly,
}) => {
  const {factory: widgetFactory, ...fieldWidgetProps} = widgetDefinition;
  const isConst = isFuncArg && fieldDefinition.valueSources && fieldDefinition.valueSources.length == 1 && fieldDefinition.valueSources[0] == "const";
  const defaultValue = fieldDefinition.defaultValue;

  if (!widgetFactory) {
    return "?";
  }
    
  let value = isSpecialRange 
    ? [immValue.get(0), immValue.get(1)] 
    : immValue.get(delta)
    ;
  const valueError = immValueError && (isSpecialRange 
    ? [immValueError.get(0), immValueError.get(1)]
    : immValueError.get(delta)
  ) || null;
  if (isSpecialRange && value[0] === undefined && value[1] === undefined)
    value = undefined;
  const {fieldSettings} = fieldDefinition || {};
  const widgetProps = Object.assign({}, fieldWidgetProps, fieldSettings, {
    config: config,
    field: field,
    fieldDefinition: fieldDefinition,
    operator: operator,
    delta: delta,
    isSpecialRange: isSpecialRange,
    isFuncArg: isFuncArg,
    value: value,
    valueError: valueError,
    label: widgetValueLabel.label,
    placeholder: widgetValueLabel.placeholder,
    placeholders: valueLabels ? valueLabels.placeholder : null,
    textSeparators: textSeparators,
    setValue: setValueHandler,
    readonly: readonly,
  });
    
  if (widget == "field") {
    //
  }

  if (isConst && defaultValue) {
    if (typeof defaultValue == "boolean") {
      return defaultValue ? (widgetProps.labelYes || "YES") : (widgetProps.labelNo || "NO");
    } else if (fieldSettings.listValues) {
      if (Array.isArray(defaultValue))
        return defaultValue.map(v => getTitleInListValues(fieldSettings.listValues, v) || v).join(", ");
      else
        return (getTitleInListValues(fieldSettings.listValues, defaultValue) || defaultValue);  
    }
    return ""+defaultValue;
  }
    
  return widgetFactory(widgetProps);
};
