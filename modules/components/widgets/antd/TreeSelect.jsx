import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import map from "lodash/map";
import { TreeSelect, Select } from "antd";
import { calcTextWidth, SELECT_WIDTH_OFFSET_RIGHT } from "../../../utils/stuff";
const Option = Select.Option;

export default class TreeSelectWidget extends PureComponent {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    value: PropTypes.array,
    field: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    customProps: PropTypes.object,
    fieldDefinition: PropTypes.object,
    // from fieldSettings:
    listValues: PropTypes.object,
    multiple: PropTypes.bool
  };



  constructor(props) {
    console.log("Tree active");
    super(props);
    this.onPropsChanged(props);
    //const treeData = getTreeData(treeDate);

  }

  componentWillReceiveProps(props) {
    this.onPropsChanged(props);
  }

  onPropsChanged(props) {
    const { listValues } = props;

    let optionsMaxWidth = 0;
    map(listValues, (label, value) => {
      optionsMaxWidth = Math.max(optionsMaxWidth, calcTextWidth(label));
    });
    this.optionsMaxWidth = optionsMaxWidth;

    this.options = map(listValues, (label, value) => {
      return (
        <Option key={value} value={value}>
          {label}
        </Option>
      );
    });
  }

  handleChange = val => {
    if (val && !val.length) val = undefined; //not allow []
    this.props.setValue(val);
  };

  
getTreeData() {
    const treeDateSetup = {
  favorites: {
    1: { id: 1, hashtag: "#Austin", group: "Austin" },
    2: { id: 2, hashtag: "#ATX", group: "Austin" },
    3: { id: 3, hashtag: "#AustinTexas", group: "Austin" },
    4: { id: 4, hashtag: "#Cleveland", group: "Cleveland" },
    5: { id: 5, hashtag: "#CLE", group: "Cleveland" },
    6: { id: 6, hashtag: "#ClevelandOhio", group: "Cleveland" },
    7: { id: 7, hashtag: "#Texas", group: "Texas" },
    8: { id: 8, hashtag: "#TX", group: "Texas" },
    9: { id: 9, hashtag: "#LoneStarState", group: "Texas" }
  },
  favoritesByGroup: {
    Austin: [1, 2, 3],
    Cleveland: [4, 5, 6],
    Texas: [7, 8, 9]
  }
};
  const entries = Object.entries(treeDateSetup.favoritesByGroup);
  const treeData = entries.map((x, i) => {
    return {
      label: x[0],
      value: `0-${i}`,
      key: `0-${i}`,
      children: x[1].map((entry, index) => {
        const hashtag = treeDateSetup.favorites[entry].hashtag;
        const key = `0-${i}-${index}`;
        return {
          label: hashtag,
          value: key,
          key: key
        };
      })
    };
  });
  return treeData;
};



  filterOption = (input, option) => {
    return (
      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    );
  };

  render() {
    const {
      config,
      placeholder,
      multiple,
      customProps,
      value
    } = this.props;
    const { renderSize } = config.settings;
    const placeholderWidth = calcTextWidth(placeholder);
    const _value = value && value.length ? value : undefined;
    const width = _value ? null : placeholderWidth + SELECT_WIDTH_OFFSET_RIGHT;
    const dropdownWidth = this.optionsMaxWidth + SELECT_WIDTH_OFFSET_RIGHT;
    const testGenerate = this.getTreeData();

    const testData = { label: "Hello", type: "world", listValues: null, multiple: false };
    let arr = [];
    arr.push(testData);
debugger;
    return (
        //       <Select
        //     mode={"multiple"}
        //     style={{
        //       minWidth: width,
        //       width: width,
        //     }}
        //     dropdownStyle={{
        //       width: dropdownWidth,
        //     }}
        //     key={"widget-treeselect"}
        //     dropdownMatchSelectWidth={false}
        //     ref="val"
        //     placeholder={placeholder}
        //     size={renderSize}
        //     value={"Hello"}
        //     onChange={this.handleChange}
        //     filterOption={this.filterOption}
        //     {...customProps}
        //   >{this.options}
        // </Select>
        //       <TreeSelect
        //     multiple={false}
        
        //     key={"widget-treeselect"}
        //     ref="val"
        //     placeholder={placeholder}
        //     size={renderSize}
        //     value={_value}
        //     disable={true}
        //    >
        // </TreeSelect>
        <TreeSelect
            style={{
              minWidth: width,
              width: width,
            }}
            dropdownStyle={{
              width: dropdownWidth,
            }}
            multiple={multiple}
            treeCheckable={false}
            key={"widget-treeselect"}
            dropdownMatchSelectWidth={false}
            ref="val"
            placeholder={placeholder}
            size={renderSize}
            treeData={testGenerate}
            onChange={this.handleChange}
             >
        </TreeSelect>
    );
  }
}
