import React from 'react';
import { mount, shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import sinon from 'sinon';

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
