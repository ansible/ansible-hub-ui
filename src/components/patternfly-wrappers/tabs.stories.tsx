import * as React from 'react';
import { Store, State } from '@sambego/storybook-state';

import { Tabs } from './tabs';

export default {
  title: 'Components / Tabs',
};

const store = new Store({
  params: {},
});

export const basic = () => (
  <State store={store}>
    <Tabs
      tabs={['Tab 1', 'Tab 2', 'Tab 3']}
      params={store.state.params}
      updateParams={p => store.set({ params: p })}
    ></Tabs>
  </State>
);
