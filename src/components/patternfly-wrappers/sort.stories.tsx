import * as React from 'react';
import { Store, State } from '@sambego/storybook-state';

import { Sort } from './sort';

export default {
  title: 'Components / Sort',
};

const store = new Store({
  params: { sort: 'download' },
});

export const basic = () => (
  <State store={store}>
    <Sort
      options={[
        { id: 'download', title: 'Download Count', type: 'numeric' },
        { id: 'upload', title: 'Upload Count', type: 'numeric' },
        { id: 'name', title: 'Name', type: 'alpha' },
      ]}
      params={store.state.params}
      updateParams={p => store.set({ params: p })}
    ></Sort>
  </State>
);
