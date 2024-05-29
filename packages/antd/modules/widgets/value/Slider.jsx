import React, { PureComponent, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { Slider, InputNumber, Col } from "antd";

const SliderWidget = React.memo(({
  setValue, placeholder, config, field, value, customProps, fieldDefinition, readonly, errorMessage,
  min, max, step, marks,
}) => {
  const {renderSize, showErrorMessage, defaultSliderWidth} = config.settings;
  const {width, ...rest} = customProps || {};
  const customInputProps = useMemo(() => rest.input || {}, [customProps]);
  const customSliderProps = useMemo(() => rest.slider || rest, [customProps]);

  const tooltipFormatter = useCallback((val) => (val != undefined ? val.toString() : undefined), []);
  const tooltip = useMemo(() => ({
    formatter: tooltipFormatter
  }), [tooltipFormatter]);

  const handleChange = useCallback((val) => {
    if (val === "")
      val = undefined;
    setValue(val);
  }, [setValue]);

  let aValue = value;
  if (aValue == undefined)
    aValue = null;
  const sliderValue = aValue == null && min ? min : aValue;

  return (
    <Col style={{display: "inline-flex", flexWrap: "wrap"}}>
      <Col key="col-number" style={{float: "left", marginRight: "5px"}}>
        <InputNumber
          key="input-number"
          disabled={readonly}
          size={renderSize}
          value={aValue}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          onChange={handleChange}
          {...customInputProps}
        />
      </Col>
      <Col key="col-slider" style={{float: "left", width: width || defaultSliderWidth}}>
        <Slider
          key="input-slider"
          disabled={readonly}
          value={sliderValue}
          tooltip={tooltip}
          min={min}
          max={max}
          included={true}
          step={step}
          marks={marks}
          onChange={handleChange}
          {...customSliderProps}
        />
      </Col>
      <Col key="col-clear" style={{clear: "both"}} />
    </Col>
  );
});

SliderWidget.displayName = "SliderWidget";
SliderWidget.propTypes = {
  setValue: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  config: PropTypes.object.isRequired,
  field: PropTypes.any,
  value: PropTypes.number,
  customProps: PropTypes.object,
  fieldDefinition: PropTypes.object,
  readonly: PropTypes.bool,
  // from fieldSettings:
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  marks: PropTypes.object,
};

export default SliderWidget;
