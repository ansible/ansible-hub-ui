import * as React from 'react';
import { Store, State } from '@sambego/storybook-state';

import { AppliedFilters } from './applied-filters';

export default {
  title: 'Components / AppliedFilters',
};

const store = new Store({
  params: {
    filter1: 'value1',
    filter2: ['value2', 'value3'],
    uGlYnAmE: ['value2', 'value3'],
    hiddenFilter: 'hidden',
  },
});

export const basic = () => (
  <State store={store}>
    <AppliedFilters
      params={store.state.params}
      updateParams={p => store.set({ params: p })}
      ignoredParams={['hiddenFilter']}
      niceNames={{ uGlYnAmE: 'Nice Name' }}
    ></AppliedFilters>
  </State>
);
