import React from 'react';
import { mount, shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import sinon from 'sinon';
const stringify = JSON.stringify;

import {
  Query, Builder, Utils, BasicConfig,
} from 'react-awesome-query-builder';
const {
  uuid, 
  checkTree, loadTree, loadFromJsonLogic, 
  queryString, sqlFormat, mongodbFormat, jsonLogicFormat
} = Utils;
import AntdConfig from 'react-awesome-query-builder/config/antd';


describe('library', () => {
  it('should be imported correctly', () => {
    expect(Query).to.exist;
    expect(Builder).to.exist;
    expect(BasicConfig).to.exist;
    expect(AntdConfig).to.exist;
  });
});


describe('<Query />', () => {
  const simple_config_with_number = {
    ...BasicConfig,
    fields: {
      num: {
        label: 'Number',
        type: 'number',
        preferWidgets: ['number'],
        fieldSettings: {
          min: -1,
          max: 5
        },
      },
    },
  };
  
  const empty_value = {id: uuid(), type: "group"};

  const init_value_with_number = {
    type: "group",
    id: uuid(),
    children1: {
      [uuid()]: {
        type: "rule",
        properties: {
          field: "num",
          operator: "equal",
          value: [2],
          valueSrc: ["value"],
          valueType: ["number"]
        }
      },
    },
    properties: {
      conjunction: "AND",
      not: false
    }
  };

  const init_jl_value_with_number = {
    "and": [{
      "==": [
        { "var": "num" },
        2
      ]
    }]
  };

  const with_qb = (config, value, valueFormat, checks) => {
    const loadFn = valueFormat == 'JsonLogic' ? loadFromJsonLogic : loadTree;
    const wrapper = mount(
      <Query
        {...config}
        value={checkTree(loadFn(value, config), config)}
        renderBuilder={render_builder}
      />
    );
    checks(wrapper);
    wrapper.unmount();
  };

  const render_builder = (props) => (
      <div className="query-builder-container" style={{padding: '10px'}}>
          <div className="query-builder qb-lite">
              <Builder {...props} />
          </div>
      </div>
  );

  describe('import', () => {
    it('should work for simple config with empty value', () => {
      with_qb(simple_config_with_number, empty_value, 'default', (qb) => {
        expect(qb.find('.query-builder')).to.have.length(1);
      });
    });

    it('should work for simple config with simple value', () => {
      with_qb(simple_config_with_number, init_value_with_number, 'default', (qb) => {
        expect(qb.find('.query-builder')).to.have.length(1);
      });
    });

    it('should work for simple config with simple value of JsonLogic format', () => {
      with_qb(simple_config_with_number, init_jl_value_with_number, 'JsonLogic', (qb) => {
        expect(qb.find('.query-builder')).to.have.length(1);
      });
    });
  });

  describe('export', () => {
    it('should work to query string', () => {
      const config = simple_config_with_number;
      const tree = checkTree(loadTree(init_value_with_number), config);
      const res = queryString(tree, config);
      expect(res).to.equal("num == 2");
      const res2 = queryString(tree, config, true);
      expect(res2).to.equal("Number == 2");
    });

    it('should work to SQL', () => {
      const config = simple_config_with_number;
      const tree = checkTree(loadTree(init_value_with_number), config);
      const res = sqlFormat(tree, config);
      expect(res).to.equal("num = 2");
    });

    it('should work to MongoDb', () => {
      const config = simple_config_with_number;
      const tree = checkTree(loadTree(init_value_with_number), config);
      const res = mongodbFormat(tree, config);
      expect(res).to.eql({num: 2});
    });

    it('should work to JsonLogic', () => {
      const config = simple_config_with_number;
      const tree = checkTree(loadTree(init_value_with_number), config);
      const {logic, data, errors} = jsonLogicFormat(tree, config);
      expect(logic).to.eql({
        and: [
          { '==': [{ "var": "num" }, 2] }
        ]
      });
      expect(data).to.eql({num: null});
      expect(errors).to.eql([]);
    });
  });

});
