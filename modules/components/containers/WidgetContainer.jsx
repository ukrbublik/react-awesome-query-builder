import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import range from 'lodash/range';
import {
    getFieldConfig, getValueLabel, getOperatorConfig, getValueSourcesForFieldOp,
    getWidgetForFieldOp, getFieldWidgetConfig, getWidgetsForFieldOp
} from "../../utils/configUtils";
import {defaultValue} from "../../utils/stuff";
import {ValueSources} from '../ValueSources';
import pick from 'lodash/pick';

const funcArgDummyOpDef = {cardinality: 1};

export default (Widget) => {
    return class WidgetContainer extends PureComponent {
        static propTypes = {
            config: PropTypes.object.isRequired,
            value: PropTypes.any.isRequired, //instanceOf(Immutable.List)
            valueSrc: PropTypes.any.isRequired, //instanceOf(Immutable.List)
            leftField: PropTypes.string, //for isFuncArg
            field: PropTypes.oneOfType([
                PropTypes.string, 
                //for isFuncArg:
                PropTypes.shape({
                    func: PropTypes.string,
                    arg: PropTypes.string
                })
            ]).isRequired,
            operator: PropTypes.string,
            //actions
            setValue: PropTypes.func,
            setValueSrc: PropTypes.func,
            //
            isFuncArg: PropTypes.bool,
        };

        constructor(props) {
            super(props);

            this.componentWillReceiveProps(props);
        }

        componentWillReceiveProps(nextProps) {
            const prevProps = this.props;
            const keysForMeta = ["config", "field", "leftField", "operator", "valueSrc", "isFuncArg"];
            const needUpdateMeta = !this.meta || keysForMeta.map(k => (nextProps[k] !== prevProps[k])).filter(ch => ch).length > 0;

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

        _onChangeValueSrc = (delta, e) => {
            let srcKey = e.target.value;
            this.props.setValueSrc(delta, srcKey);
        }

        getMeta({config, field, operator, valueSrc: valueSrcs, isFuncArg}) {
            const fieldDefinition = getFieldConfig(field, config);
            const defaultWidget = getWidgetForFieldOp(config, field, operator);
            const _widgets = getWidgetsForFieldOp(config, field, operator);
            const operatorDefinition = isFuncArg ? funcArgDummyOpDef : getOperatorConfig(config, operator, field);
            if (fieldDefinition == null || operatorDefinition == null) {
                return null;
            }
            const isSpecialRange = operatorDefinition.isSpecialRange;
            const isSpecialRangeForSrcField = isSpecialRange && (valueSrcs.get(0) == 'field' || valueSrcs.get(1) == 'field');
            const isTrueSpecialRange = isSpecialRange && !isSpecialRangeForSrcField;
            const cardinality = isTrueSpecialRange ? 1 : defaultValue(operatorDefinition.cardinality, 1);
            if (cardinality === 0) {
                return null;
            }

            const valueSources = getValueSourcesForFieldOp(config, field, operator);

            const widgets = range(0, cardinality).map(delta => {
                const valueSrc = valueSrcs.get(delta) || null;
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
                widgets
            };
        }

        render() {
            const {config, field, isFuncArg, leftField, operator, value} = this.props;
            const _field = isFuncArg ? leftField : field;
            const {settings} = config;
            const meta = this.meta;
            if (!meta)
                return null;
            const {
                defaultWidget, cardinality, valueSources, widgets
            } = meta;

            return (
                <Widget name={defaultWidget} config={config}>
                    {range(0, cardinality).map(delta => {
                        const {valueSrc, valueLabel, sepText, setValueSrcHandler} = widgets[delta];

                        //if (!valueSrc && valueSources.length == 1) {
                        //    this.props.setValueSrc(delta, valueSources[0]);
                        //}

                        const sepLabel = settings.showLabels ?
                            <label>&nbsp;</label>
                            : null;
                        const sourceLabel = settings.showLabels ?
                            <label>&nbsp;</label>
                            : null;
                        const widgetLabel = settings.showLabels ?
                            <label>{valueLabel.label}</label>
                            : null;

                        const sep = sepText &&
                            <div key={"widget-separators-"+delta} className="widget--sep" >
                                {sepLabel}
                                <span>{sepText}</span>
                            </div>

                        const sources = valueSources.length > 1 &&
                            <div key={"valuesrc-"+_field+"-"+delta} className="widget--valuesrc">
                                {sourceLabel}
                                <ValueSources
                                    key={'valuesrc-'+delta}
                                    delta={delta}
                                    valueSources={valueSources}
                                    valueSrc={valueSrc}
                                    config={config}
                                    field={_field}
                                    operator={operator}
                                    setValueSrcHandler={setValueSrcHandler}
                                />
                            </div>

                        const widgetCmp = 
                            <div key={"widget-"+_field+"-"+delta} className="widget--widget">
                                {valueSrc == 'func' ? null : widgetLabel}
                                <WidgetFactory
                                    delta={delta}
                                    value={value}
                                    isFuncArg={isFuncArg}
                                    {...pick(meta, ['isSpecialRange', 'fieldDefinition'])}
                                    {...pick(widgets[delta], ['widget', 'widgetDefinition', 'widgetValueLabel', 'valueLabels', 'textSeparators', 'setValueHandler'])}
                                    config={config}
                                    field={_field}
                                    operator={operator}
                                />
                            </div>

                        return [
                            sep,
                            sources,
                            widgetCmp
                        ];
                    })}
                </Widget>
            );
        }
    };
};


const WidgetFactory = ({
    delta, isFuncArg,
    value: immValue,
    isSpecialRange, fieldDefinition,
    widget, widgetDefinition, widgetValueLabel, valueLabels, textSeparators, setValueHandler,
    config, field, operator
}) => {
    const {factory: widgetFactory, ...fieldWidgetProps} = widgetDefinition;

    if (!widgetFactory) {
        return '?';
    }
    
    let value = isSpecialRange ? 
        [immValue.get(0), immValue.get(1)] 
        : immValue.get(delta)
    ;
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
        label: widgetValueLabel.label,
        placeholder: widgetValueLabel.placeholder,
        placeholders: valueLabels ? valueLabels.placeholder : null,
        textSeparators: textSeparators,
        setValue: setValueHandler,
    });
    
    if (widget == 'field') {
        //
    }
    
    return widgetFactory(widgetProps);
};
