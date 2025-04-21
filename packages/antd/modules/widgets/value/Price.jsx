import React, { useCallback, useRef } from "react";
import { InputNumber } from "antd";
import { Utils } from "@react-awesome-query-builder/ui";
const { getNumberFormatProps, numericFormatter, numericParser, addLeadingZeros, addTrailingZeros } = Utils.NumberFormat;

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

  const numericFormatProps = {
    ...getNumberFormatProps(props, ["prefix", "suffix"]),
    min, max,
  };
  const numericFormatPropsJson = JSON.stringify(numericFormatProps);

  const { renderSize } = config.settings;
  const aValue = value != undefined ? value : undefined;

  const lastValueRef = useRef(undefined);

  const extFormatter = useCallback((numOrStr) => {
    const num = parseFloat(numOrStr);
    const prev = lastValueRef.current;
    let extraLeadingZeros, trailingZeros;
    let str = numericFormatter(numOrStr, numericFormatProps);
    if (prev?.num === num) {
      if (prev?.extraLeadingZeros) {
        // Just to keep zeros in case of `allowLeadingZeros: true`
        extraLeadingZeros = prev.extraLeadingZeros;
        str = addLeadingZeros(str, extraLeadingZeros);
      }
      if (prev?.trailingZeros) {
        // To prevent `1.009` -> `1` (should be `1.00`) after removing "9"
        trailingZeros = prev.trailingZeros;
        str = addTrailingZeros(str, trailingZeros);
      }
    }
    if (str !== lastValueRef.current?.str) {
      lastValueRef.current = {
        num,
        str,
        extraLeadingZeros,
        trailingZeros,
      };
    }
    return str;
  }, [numericFormatPropsJson]);

  const extParser = useCallback((str) => {
    const prev = lastValueRef.current;
    const prevStr = prev?.str;
    const res = numericParser(str, numericFormatProps, prevStr);
    if (str !== prevStr) {
      lastValueRef.current = res;
    }
    return res.num;
  }, [numericFormatPropsJson]);

  const handleChange = useCallback((val) => {
    if (val === "" || val === null)
      val = undefined;
    setValue(val);
  }, [setValue]);

  return (
    <InputNumber
      formatter={extFormatter}
      parser={extParser}
      size={renderSize}
      value={aValue}
      placeholder={placeholder}
      disabled={readonly}
      onChange={handleChange}
      min={min}
      max={max}
      step={step}
      prefix={prefix}
      suffix={suffix}
      style={{ width: "150px" }}
      {...customProps}
    />
  );
};
