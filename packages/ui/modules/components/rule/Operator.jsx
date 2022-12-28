import React, { PureComponent } from "react";
import { Utils } from "@react-awesome-query-builder/core";
import PropTypes from "prop-types";
import keys from "lodash/keys";
import pickBy from "lodash/pickBy";
import mapValues from "lodash/mapValues";
import {useOnPropsChanged} from "../../utils/reactUtils";
const {getFieldConfig, getOperatorConfig} = Utils.ConfigUtils;


export default class Operator extends PureComponent {
  static propTypes = {
    id: PropTypes.string,
    groupId: PropTypes.string,
    config: PropTypes.object.isRequired,
    selectedField: PropTypes.string,
    selectedOperator: PropTypes.string,
    readonly: PropTypes.bool,
    //actions
    setOperator: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);

    this.onPropsChanged(props);
  }

  onPropsChanged(nextProps) {
    const prevProps = this.props;
    const keysForMeta = ["config", "selectedField", "selectedOperator"];
    const needUpdateMeta = !this.meta || keysForMeta.map(k => (nextProps[k] !== prevProps[k])).filter(ch => ch).length > 0;

    if (needUpdateMeta) {
      this.meta = this.getMeta(nextProps);
    }
  }

  getMeta({config, selectedField, selectedOperator}) {
    const fieldConfig = getFieldConfig(config, selectedField);
    const operators = fieldConfig?.operators;
    const operatorOptions 
      = mapValues(
        pickBy(
          config.operators, 
          (item, key) => operators?.indexOf(key) !== -1
        ), 
        (_opts, op) => getOperatorConfig(config, op, selectedField)
      );
      
    const items = this.buildOptions(config, operatorOptions, operators);

    const isOpSelected = !!selectedOperator;
    const currOp = isOpSelected ? operatorOptions[selectedOperator] : null;
    const selectedOpts = currOp || {};
    const placeholder = this.props.config.settings.operatorPlaceholder;
    const selectedKey = selectedOperator;
    const selectedKeys = isOpSelected ? [selectedKey] : null;
    const selectedPath = selectedKeys;
    const selectedLabel = selectedOpts.label;
    
    return {
      placeholder, items,
      selectedKey, selectedKeys, selectedPath, selectedLabel, selectedOpts, fieldConfig
    };
  }

  buildOptions(config, fields, ops) {
    if (!fields || !ops)
      return null;

    return keys(fields).sort((a, b) => (ops.indexOf(a) - ops.indexOf(b))).map(fieldKey => {
      const field = fields[fieldKey];
      const label = field.label;
      return {
        key: fieldKey,
        path: fieldKey,
        label,
      };
    });
  }

  render() {
    const {config, customProps, setOperator, readonly, id, groupId} = this.props;
    const {renderOperator} = config.settings;
    const renderProps = {
      id,
      groupId,
      config, 
      customProps, 
      readonly,
      setField: setOperator,
      ...this.meta
    };
    if (!renderProps.items)
      return null;
    return renderOperator(renderProps);
  }


}
