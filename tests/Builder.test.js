import { mount } from 'enzyme';
import React from 'react';
import { act } from 'react-dom/test-utils';
import sinon from 'sinon';
import { Tooltip, Select } from 'antd';

import {
  Query, Builder, Utils, BasicConfig,
} from 'react-awesome-query-builder';
import AntdConfig from 'react-awesome-query-builder/config/antd';


describe('<Query />', () => {
  it('should exist', () => {
    expect(Query).to.exist;
    expect(BasicConfig).to.exist;
    expect(AntdConfig).to.exist;
  });
});
