import * as React from 'react';
import { Store, State } from '@sambego/storybook-state';

import { UserForm } from './user-form';
import { UserType } from '../../api';

export default {
  title: 'Components / UserForm',
};

const store = new Store({
  user: {
    id: 2,
    username: 'ansible-insights',
    first_name: 'Ansible',
    last_name: 'Insights',
    email: 'insights@ansible.com',
    groups: [
      {
        id: 2,
        name: 'rh-identity-account:6269497',
      },
    ],
    date_joined: '2020-05-11T17:36:01.261721Z',
    password: 'password',
  } as UserType,
});

export const basic = () => {
  console.log(store.state);
  return (
    <State store={store}>
      <UserForm
        user={store.get('user')}
        updateUser={u => store.set({ user: u })}
        errorMessages={{ first_name: 'it broke' }}
      ></UserForm>
    </State>
  );
};
