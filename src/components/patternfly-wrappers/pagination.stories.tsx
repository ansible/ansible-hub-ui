import * as React from 'react';
import { Store, State } from '@sambego/storybook-state';

import { Pagination } from './pagination';

export default {
  title: 'Components / Pagination',
};

const store = new Store({
  params: {},
});

export const basic = () => (
  <State store={store}>
    <Pagination
      count={100}
      params={store.state.params}
      updateParams={p => store.set({ params: p })}
    ></Pagination>
  </State>
);

export const compact = () => (
  <State store={store}>
    <Pagination
      count={100}
      params={store.state.params}
      updateParams={p => store.set({ params: p })}
      isCompact
    ></Pagination>
  </State>
);

export const perPageOptions = () => (
  <State store={store}>
    <Pagination
      count={100}
      params={store.state.params}
      updateParams={p => store.set({ params: p })}
      perPageOptions={[12, 24]}
    ></Pagination>
  </State>
);

export const isTop = () => (
  <State store={store}>
    <Pagination
      count={100}
      params={store.state.params}
      updateParams={p => store.set({ params: p })}
      isTop={true}
    ></Pagination>
  </State>
);
