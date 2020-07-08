import * as React from 'react';

import { NumericLabel } from './numeric-label';

export default {
  title: 'Components / NumericLabel',
};

export const basic = () => (
  <NumericLabel number={93939} label={'GB'} hideNumber={false}></NumericLabel>
);
