import React, { useCallback } from "react";
import { InputNumber } from "antd";
import { Utils } from "@react-awesome-query-builder/ui";
const { getNumberFormatProps, numericFormatter, numericParser } = Utils.NumberFormat;

export default (props) => {
  const {
    value,
    setValue,
    readonly,
    placeholder,
    config,
    min,
    max,
    step,
    customProps,

    prefix,
    suffix,
  } = props;

  const numericFormatProps = getNumberFormatProps(props, ["prefix", "suffix"]);
  const numericFormatPropsJson = JSON.stringify(numericFormatProps);

  const { renderSize } = config.settings;
  const aValue = value != undefined ? value : undefined;

  const currencyFormatter = useCallback((val) => {
    return numericFormatter(val, numericFormatProps);
  }, [numericFormatPropsJson]);

  const currencyParser = useCallback((str) => {
    return numericParser(str, numericFormatProps);
  }, [numericFormatPropsJson]);

  const handleChange = useCallback((val) => {
    if (val === "" || val === null)
      val = undefined;
    setValue(val);
  }, [setValue]);

  return (
    <InputNumber
      formatter={currencyFormatter}
      // decimalSeparator={numericFormatProps.decimalSeparator}
      // precision={numericFormatProps.decimalScale}
      parser={currencyParser}
      size={renderSize}
      value={aValue}
      placeholder={placeholder}
      disabled={readonly}
      onChange={handleChange}
      // min={min}
      // max={max}
      step={step}
      prefix={prefix}
      suffix={suffix}
      {...customProps}
    />
  );
};
