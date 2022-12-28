import React, { PureComponent } from "react";
import { Utils } from "@react-awesome-query-builder/core";
import PropTypes from "prop-types";
import range from "lodash/range";
import {defaultValue} from "../../utils/stuff";
import {useOnPropsChanged} from "../../utils/reactUtils";
import pick from "lodash/pick";
import WidgetFactory from "./WidgetFactory";
import {Col} from "../utils";
const {getFieldConfig, getOperatorConfig, getFieldWidgetConfig} = Utils.ConfigUtils;
const {getValueSourcesForFieldOp, getWidgetsForFieldOp, getWidgetForFieldOp, getValueLabel} = Utils.RuleUtils;
const { createListFromArray } = Utils.DefaultUtils;

const funcArgDummyOpDef = {cardinality: 1};

export default class Widget extends PureComponent {
  static propTypes = {
    config: PropTypes.object.isRequired,
    value: PropTypes.any, //instanceOf(Immutable.List)
    valueSrc: PropTypes.any, //instanceOf(Immutable.List)
    valueError: PropTypes.any,
    field: PropTypes.string,
    operator: PropTypes.string,
    readonly: PropTypes.bool,
    asyncListValues: PropTypes.array,
    id: PropTypes.string,
    groupId: PropTypes.string,
    //actions
    setValue: PropTypes.func,
    setValueSrc: PropTypes.func,
    // for isFuncArg
    isFuncArg: PropTypes.bool,
    fieldFunc: PropTypes.string,
    fieldArg: PropTypes.string,
    leftField: PropTypes.string,
    // for RuleGroupExt
    isForRuleGruop: PropTypes.bool,
    parentField: PropTypes.string,
    // for func in func
    parentFuncs: PropTypes.array,
    // for case_value
    isCaseValue: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);

    this.onPropsChanged(props);
  }

  onPropsChanged(nextProps) {
    const prevProps = this.props;
    const keysForMeta = [
      "config", "field", "fieldFunc", "fieldArg", "leftField", "operator", "valueSrc", "isFuncArg", "asyncListValues"
    ];
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

  _setValue = (isSpecialRange, delta, widgetType, value, asyncListValues, __isInternal) => {
    if (isSpecialRange && Array.isArray(value)) {
      const oldRange = [this.props.value.get(0), this.props.value.get(1)];
      if (oldRange[0] != value[0])
        this.props.setValue(0, value[0], widgetType, asyncListValues, __isInternal);
      if (oldRange[1] != value[1])
        this.props.setValue(1, value[1], widgetType, asyncListValues, __isInternal);
    } else {
      this.props.setValue(delta, value, widgetType, asyncListValues, __isInternal);
    }
  };

  _onChangeValueSrc = (delta, srcKey) => {
    this.props.setValueSrc(delta, srcKey);
  };

  getMeta({
    config, field: simpleField, fieldFunc, fieldArg, operator, valueSrc: valueSrcs, value: values, 
    isForRuleGruop, isCaseValue, isFuncArg, leftField, asyncListValues
  }) {
    const field = isFuncArg ? {func: fieldFunc, arg: fieldArg} : simpleField;
    let iValueSrcs = valueSrcs;
    let iValues = values;
    if (isFuncArg || isForRuleGruop || isCaseValue) {
      iValueSrcs = createListFromArray([valueSrcs]);
      iValues = createListFromArray([values]);
    }

    const fieldDefinition = getFieldConfig(config, field);
    const defaultWidget = getWidgetForFieldOp(config, field, operator);
    const _widgets = getWidgetsForFieldOp(config, field, operator);
    const operatorDefinition = isFuncArg ? funcArgDummyOpDef : getOperatorConfig(config, operator, field);
    if ((fieldDefinition == null || operatorDefinition == null) && !isCaseValue) {
      return null;
    }
    const isSpecialRange = operatorDefinition?.isSpecialRange;
    const isSpecialRangeForSrcField = isSpecialRange && (iValueSrcs.get(0) == "field" || iValueSrcs.get(1) == "field");
    const isTrueSpecialRange = isSpecialRange && !isSpecialRangeForSrcField;
    const cardinality = isTrueSpecialRange ? 1 : defaultValue(operatorDefinition?.cardinality, 1);
    if (cardinality === 0) {
      return null;
    }

    const valueSources = getValueSourcesForFieldOp(config, field, operator, fieldDefinition, isFuncArg ? leftField : null);

    const widgets = range(0, cardinality).map(delta => {
      const valueSrc = iValueSrcs.get(delta) || null;
      let widget = getWidgetForFieldOp(config, field, operator, valueSrc);
      let widgetDefinition = getFieldWidgetConfig(config, field, operator, widget, valueSrc);
      if (isSpecialRangeForSrcField) {
        widget = widgetDefinition.singleWidget;
        widgetDefinition = getFieldWidgetConfig(config, field, operator, widget, valueSrc);
      }
      const widgetType = widgetDefinition?.type;
      const valueLabel = getValueLabel(config, field, operator, delta, valueSrc, isTrueSpecialRange);
      const widgetValueLabel = getValueLabel(config, field, operator, delta, null, isTrueSpecialRange);
      const sepText = operatorDefinition?.textSeparators ? operatorDefinition?.textSeparators[delta] : null;
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
        textSeparators = operatorDefinition?.textSeparators;
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
      iValues, //correct for isFuncArg
      aField: field, //correct for isFuncArg
      asyncListValues,
    };
  }

  renderWidget = (delta, meta, props) => {
    const {config, isFuncArg, leftField, operator, value: values, valueError, readonly, parentField, parentFuncs, id, groupId} = props;
    const {settings} = config;
    const { widgets, iValues, aField } = meta;
    const value = isFuncArg ? iValues : values;
    const field = isFuncArg ? leftField : aField;
    const {valueSrc, valueLabel} = widgets[delta];
 
    const widgetLabel = settings.showLabels
      ? <label className="rule--label">{valueLabel.label}</label>
      : null;

    return (
      <div key={"widget-"+field+"-"+delta} className="widget--widget">
        {valueSrc == "func" ? null : widgetLabel}
        <WidgetFactory
          id={id}
          groupId={groupId}
          valueSrc={valueSrc}
          delta={delta}
          value={value}
          valueError={valueError}
          isFuncArg={isFuncArg}
          {...pick(meta, ["isSpecialRange", "fieldDefinition", "asyncListValues"])}
          {...pick(widgets[delta], ["widget", "widgetDefinition", "widgetValueLabel", "valueLabels", "textSeparators", "setValueHandler"])}
          config={config}
          field={field}
          parentField={parentField}
          parentFuncs={parentFuncs}
          operator={operator}
          readonly={readonly}
        />
      </div>
    );
  };

  renderValueSources = (delta, meta, props) => {
    const {config, isFuncArg, leftField, operator, readonly} = props;
    const {settings} = config;
    const { valueSources, widgets, aField } = meta;
    const field = isFuncArg ? leftField : aField;
    const {valueSrc, setValueSrcHandler} = widgets[delta];
    const {valueSourcesInfo, renderValueSources: ValueSources} = settings;
    const valueSourcesOptions = valueSources.map(srcKey => [srcKey, {
      label: valueSourcesInfo[srcKey].label
    }]);

    const sourceLabel = settings.showLabels
      ? <label className="rule--label">&nbsp;</label>
      : null;

    return valueSources.length > 1 && !readonly
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
  };

  renderSep = (delta, meta, props) => {
    const {config} = props;
    const {widgets} = meta;
    const {settings} = config;
    const {sepText} = widgets[delta];

    const sepLabel = settings.showLabels
      ? <label className="rule--label">&nbsp;</label>
      : null;

    return sepText
      && <div key={"widget-separators-"+delta} className="widget--sep" >
        {sepLabel}
        <span>{sepText}</span>
      </div>;
  };

  renderWidgetDelta = (delta) => {
    const sep = this.renderSep(delta, this.meta, this.props);
    const sources = this.renderValueSources(delta, this.meta, this.props);
    const widgetCmp = this.renderWidget(delta, this.meta, this.props);

    return [
      sep,
      sources,
      widgetCmp,
    ];
  };

  render() {
    if (!this.meta) return null;
    const { defaultWidget, cardinality } = this.meta;
    if (!defaultWidget) return null;
    const name = defaultWidget;

    return (
      <Col
        className={`rule--widget rule--widget--${name.toUpperCase()}`}
        key={"widget-col-"+name}
      >
        {range(0, cardinality).map(this.renderWidgetDelta)}
      </Col>
    );
  }

}
