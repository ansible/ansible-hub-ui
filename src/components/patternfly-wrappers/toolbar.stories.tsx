import * as React from 'react';
import { Store, State } from '@sambego/storybook-state';

import { Toolbar } from './toolbar';

export default {
  title: 'Components / Toolbar',
};

const store = new Store({
  params: {},
});

export const basic = () => (
  <State store={store}>
    <Toolbar
      params={store.state.params}
      sortOptions={[
        { id: 'download', title: 'Download Count', type: 'numeric' },
        { id: 'upload', title: 'Upload Count', type: 'numeric' },
        { id: 'name', title: 'Name', type: 'alpha' },
      ]}
      updateParams={p => store.set({ params: p })}
      searchPlaceholder={'Placeholder goes here'}
      extraInputs={[<div key={1}>Input 1</div>, <div key={2}>Input 2</div>]}
    ></Toolbar>
  </State>
);
