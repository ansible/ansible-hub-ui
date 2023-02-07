import { Bullseye, Spinner } from '@patternfly/react-core';
import * as React from 'react';

export class LoadingPageSpinner extends React.Component {
  render() {
    return (
      <Bullseye style={{ width: '100%', height: '100%' }}>
        <Spinner />
      </Bullseye>
    );
  }
}
