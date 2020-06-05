import * as React from 'react';

import { SortTable } from './sort-table';
import { State, Store } from '@sambego/storybook-state';

export default {
  title: 'Components / SortTable',
};

const store = new Store({
  params: { sort: 'number' },
});

const options = {
  headers: [
    {
      title: 'Name',
      type: 'aplha',
      id: 'name',
    },
    {
      title: 'Number',
      type: 'numeric',
      id: 'number',
    },
  ],
};

export const basic = () => (
  <State store={store}>
    <SortTable
      options={options}
      params={store.state.params}
      updateParams={p => store.set({ params: p })}
    ></SortTable>
  </State>
);
