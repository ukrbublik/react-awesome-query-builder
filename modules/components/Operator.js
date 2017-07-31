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
import pickBy from 'lodash/pickBy';
import mapValues from 'lodash/mapValues';

export default class Operator extends Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    selectedField: PropTypes.string,
    selectedOperator: PropTypes.string,
    setOperator: PropTypes.func.isRequired,
    renderAsDropdown: PropTypes.bool,
  };

  shouldComponentUpdate = shallowCompare;

  constructor(props) {
      super(props);
      this.onPropsChanged(props);
  }

  componentWillReceiveProps (props) {
      this.onPropsChanged(props);
  }
  
  onPropsChanged (props) {
      let fieldConfig = getFieldConfig(props.selectedField, props.config);
      this.operatorOptions = mapValues(pickBy(props.config.operators, (item, index) =>
          fieldConfig && fieldConfig.operators && fieldConfig.operators.indexOf(index) !== -1
      ));
  }

  curOpOpts() {
      return Object.assign({}, {label: this.props.selectedOperator}, this.operatorOptions[this.props.selectedOperator] || {});
  }

  handleOperatorSelect({key, keyPath}) {
      this.props.setOperator(key);
  }

  buildMenuItems(fields) {
      if (!fields)
          return null;
      return keys(fields).map(fieldKey => {
          let field = fields[fieldKey];
          return <MenuItem key={fieldKey}>{field.label}</MenuItem>;
      });
  }

  buildMenuToggler(label) {
      var toggler = 
          <Button 
              size={this.props.config.settings.renderSize || "small"}
          >
              {label} <span className="caret"/>
          </Button>;

      return toggler;
  }

  render() {
    let selectedOpKey = this.props.selectedOperator;
    let opMenuItems = this.buildMenuItems(this.operatorOptions);
    let opMenu = (
        <Menu 
            //size={this.props.config.settings.renderSize || "small"}
            selectedKeys={[selectedOpKey]}
            onClick={this.handleOperatorSelect.bind(this)}
        >{opMenuItems}</Menu>
    );
    let opToggler = this.buildMenuToggler(this.curOpOpts().label || this.props.config.settings.operatorPlaceholder);


    return (
      <Dropdown 
          overlay={opMenu} 
          trigger={['click']}
      >
          {opToggler}
      </Dropdown>
    );
  }
}
