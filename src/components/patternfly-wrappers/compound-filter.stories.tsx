import * as React from 'react';
import { Store, State } from '@sambego/storybook-state';

import { CompoundFilter } from './compound-filter';
import { AppliedFilters } from './applied-filters';

export default {
  title: 'Components / CompoundFilter',
};

const filterConfig = [
  {
    id: 'filter1',
    title: 'Filter One',
    placeholder: 'Placeholder on filter one',
    inputType: 'text-field',
  },
  {
    id: 'filter2',
    title: 'Filter Two',
    placeholder: 'Placeholder on filter two',
    inputType: 'select',
    options: [
      { id: 'one', title: 'Option 1' },
      { id: 'two', title: 'Option 2' },
    ],
  },
] as any;

const store = new Store({
  params: { filter1: 'hello world' },
});
export const basic = state => (
  <State store={store}>
    <CompoundFilter
      filterConfig={filterConfig}
      params={store.state.params}
      updateParams={p => store.set({ params: p })}
    ></CompoundFilter>
  </State>
);

export const exampleWithAppliedFilters = () => (
  <State store={store}>
    <CompoundFilter
      filterConfig={filterConfig}
      params={store.state.params}
      updateParams={p => store.set({ params: p })}
    ></CompoundFilter>
    <AppliedFilters
      params={store.state.params}
      updateParams={p => store.set({ params: p })}
    ></AppliedFilters>
  </State>
);
