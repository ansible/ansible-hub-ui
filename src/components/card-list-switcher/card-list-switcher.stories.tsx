import * as React from 'react';

import { CardListSwitcher } from './card-list-switcher';
import { State, Store } from '@sambego/storybook-state';

export default {
  title: 'Components / CardListSwitcher',
};

const store = new Store({
  params: { view_type: 'card' },
});

export const basic = () => (
  <State store={store}>
    <CardListSwitcher
      params={store.state.params}
      updateParams={p => store.set({ params: p })}
    ></CardListSwitcher>
  </State>
);
