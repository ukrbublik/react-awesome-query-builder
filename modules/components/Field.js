import { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import {getFieldConfig, getFieldPath, getFieldPathLabels} from "../utils/index";
import { Menu, Dropdown, Icon, Tooltip, Button } from 'antd';
const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;
const DropdownButton = Dropdown.Button;
import map from 'lodash/map';
import last from 'lodash/last';
import keys from 'lodash/keys';

export default class Field extends Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    selectedField: PropTypes.string,
    setField: PropTypes.func.isRequired,
    renderAsDropdown: PropTypes.bool,
  };

  shouldComponentUpdate = shallowCompare;

  curFieldOpts() {
      return Object.assign({}, {label: this.props.selectedField}, getFieldConfig(this.props.selectedField, this.props.config) || {});
  }

  handleFieldSelect({key, keyPath}) {
    this.props.setField(key);
  }

  buildMenuItems(fields, path = null) {
      let fieldSeparator = this.props.config.settings.fieldSeparator;
      if (!fields)
          return null;
      let prefix = path ? path.join(fieldSeparator) + fieldSeparator : '';

      return keys(fields).map(fieldKey => {
          let field = fields[fieldKey];
          if (field.widget == "!struct") {
              let subpath = (path ? path : []).concat(fieldKey);
              return <SubMenu 
                  key={prefix+fieldKey} 
                  title={<span>{field.label || last(fieldKey.split(fieldSeparator))} &nbsp;&nbsp;&nbsp;&nbsp;</span>}
              >
                  {this.buildMenuItems(field.subfields, subpath)}
              </SubMenu>
          } else {
              return <MenuItem key={prefix+fieldKey}>{field.label || last(fieldKey.split(fieldSeparator))}</MenuItem>;
          }
      });
  }

  buildMenuToggler(label, fullLabel, customLabel) {
      var toggler = 
          <Button 
              size={this.props.config.settings.renderSize || "small"}
          >
              {customLabel ? customLabel : label} <span className="caret"/>
          </Button>;

      if (fullLabel && fullLabel != label) {
          toggler = <Tooltip
                  placement="top"
                  title={fullLabel}
              >
              {toggler}
              </Tooltip>;
      }

      return toggler;
  }

  render() {
    let fieldOptions = this.props.config.fields;
    let selectedFieldsKeys = getFieldPath(this.props.selectedField, this.props.config);
    let selectedFieldPartsLabels = getFieldPathLabels(this.props.selectedField, this.props.config);
    let selectedFieldFullLabel = selectedFieldPartsLabels ? selectedFieldPartsLabels.join(this.props.config.settings.fieldSeparatorDisplay) : null;

    let fieldMenuItems = this.buildMenuItems(fieldOptions);
    let fieldMenu = (
        <Menu 
            //size={this.props.config.settings.renderSize || "small"}
            selectedKeys={selectedFieldsKeys}
            onClick={this.handleFieldSelect.bind(this)}
        >{fieldMenuItems}</Menu>
    );
    let fieldToggler = this.buildMenuToggler(this.curFieldOpts().label || this.props.config.settings.selectFieldLabel, 
        selectedFieldFullLabel, this.curFieldOpts().label2);

    return (
      <Dropdown 
          overlay={fieldMenu} 
          trigger={['click']}
      >
          {fieldToggler}
      </Dropdown>
    );
  }
}
