import { Bullseye, Spinner } from '@patternfly/react-core';
import React, { Component } from 'react';

export class LoadingPageSpinner extends Component {
  render() {
    return (
      <Bullseye style={{ width: '100%', height: '100%' }}>
        <Spinner />
      </Bullseye>
    );
  }
}
