import * as React from 'react';
import { Store, State } from '@sambego/storybook-state';

import { AlertList } from './alert-list';

export default {
  title: 'Components / AlertList',
};

const store = new Store({
  alerts: [
    {
      variant: 'warning',
      title: 'demo alert',
      description: "I'm a description!",
    },
    {
      variant: 'info',
      title: 'demo alert 2',
      description: "I'm a description!",
    },
    {
      variant: 'success',
      title: 'demo alert 3',
      description: "I'm a description!",
    },
    {
      variant: 'danger',
      title: 'demo alert 4',
      description: "I'm a description!",
    },
  ] as any,
});

export const basic = () => (
  <State store={store}>
    <AlertList
      alerts={store.state.alerts}
      closeAlert={i => {
        const alerts = store.get('alerts');
        alerts.splice(i, 1);
        store.set({ alerts: alerts });
      }}
    ></AlertList>
  </State>
);
