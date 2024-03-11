import { Bullseye } from '@patternfly/react-core';
import React from 'react';
import { Spinner } from 'src/components';

export const LoadingSpinner = () => (
  <Bullseye style={{ width: '100%', height: '100%' }}>
    <Spinner />
  </Bullseye>
);
