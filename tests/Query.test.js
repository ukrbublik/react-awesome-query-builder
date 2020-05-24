import React from 'react';
import { mount, shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import sinon from 'sinon';

import {
  Query, Builder, Utils, BasicConfig,
} from 'react-awesome-query-builder';
const {uuid, checkTree, loadTree} = Utils;
import AntdConfig from 'react-awesome-query-builder/config/antd';


describe('import', () => {
  it('should work', () => {
    expect(Query).to.exist;
    expect(Builder).to.exist;
    expect(BasicConfig).to.exist;
    expect(AntdConfig).to.exist;
  });
});


describe('<Query />', () => {
  const build_config = () => {
    const fields = {
      num: {
          label: 'Number',
          type: 'number',
          preferWidgets: ['number'],
          fieldSettings: {
              min: -1,
              max: 5
          },
      },
    };
    
    return {
      ...BasicConfig,
      fields
    };
  };
  
  const empty_value = {id: uuid(), type: "group"};

  const init_value = {
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
  }

  const with_qb = (config, value, checks) => {
    const wrapper = mount(
      <Query
        {...config}
        value={checkTree(loadTree(value), config)}
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

  it('should load simple config with empty value', () => {
    with_qb(build_config(), empty_value, (qb) => {
      expect(qb.find('.query-builder')).to.have.length(1);
    });
  });

  it('should load simple config with simple value', () => {
    with_qb(build_config(), init_value, (qb) => {
      expect(qb.find('.query-builder')).to.have.length(1);
    });
  });
});
