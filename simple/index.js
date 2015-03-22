import React from 'react';
import { Builder, Preview } from 'react-query-builder';
import config from './config';

class Simple extends React.Component {
  render () {
    return (
      <div>
        <Preview {...config} />
        <Builder {...config} />
      </div>
    );
  }
}

export default Simple;