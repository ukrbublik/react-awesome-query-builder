import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {getFieldConfig, getFieldPath, getFieldPathLabels} from "../utils/configUtils";
import {calcTextWidth, BUILT_IN_PLACEMENTS, SELECT_WIDTH_OFFSET_RIGHT} from "../utils/stuff";
import { Menu, Dropdown, Icon, Tooltip, Button, Select } from 'antd';
const { Option, OptGroup } = Select;
const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;
const DropdownButton = Dropdown.Button;
import map from 'lodash/map';
import last from 'lodash/last';
import keys from 'lodash/keys';
import pickBy from 'lodash/pickBy';
import mapValues from 'lodash/mapValues';


export default class Operator extends PureComponent {
  static propTypes = {
    config: PropTypes.object.isRequired,
    selectedField: PropTypes.string,
    selectedOperator: PropTypes.string,
    //actions
    setOperator: PropTypes.func.isRequired,
  };

  constructor(props) {
      super(props);

      this.componentWillReceiveProps(props);
  }

  componentWillReceiveProps(nextProps) {
      const prevProps = this.props;
      const keysForMeta = ["config", "selectedField", "selectedOperator"];
      const needUpdateMeta = !this.meta || keysForMeta.map(k => (nextProps[k] !== prevProps[k])).filter(ch => ch).length > 0;

      if (needUpdateMeta) {
          this.meta = this.getMeta(nextProps);
      }
  }

  getMeta({config, selectedField, selectedOperator}) {
    const fieldConfig = getFieldConfig(selectedField, config);
    const operatorOptions = mapValues(pickBy(config.operators, (item, key) =>
        fieldConfig && fieldConfig.operators && fieldConfig.operators.indexOf(key) !== -1
    ));
      
    const items = this.buildOptions(config, operatorOptions);

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
        selectedKey, selectedKeys, selectedPath, selectedLabel, selectedOpts
    };
  }

  buildOptions(config, fields) {
    if (!fields)
        return null;

    return keys(fields).map(fieldKey => {
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
      const {config, customProps, setOperator} = this.props;
      const {renderOperator} = config.settings;
      const renderProps = {
          config, 
          customProps, 
          setField: setOperator,
          ...this.meta
      };
      return renderOperator(renderProps);
  }


}
