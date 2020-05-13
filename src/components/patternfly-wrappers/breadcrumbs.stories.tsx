import * as React from 'react';
import { MemoryRouter } from 'react-router';

import { Breadcrumbs } from './breadcrumbs';

export default {
  title: 'Components / Breadcrumbs',
};

export const basic = () => (
  <Breadcrumbs
    links={[{ name: 'root', url: 'root' }, { name: 'leaf' }]}
  ></Breadcrumbs>
);
basic.story = {
  decorators: [
    story => <MemoryRouter initialEntries={['/']}>{story()}</MemoryRouter>,
  ],
};
