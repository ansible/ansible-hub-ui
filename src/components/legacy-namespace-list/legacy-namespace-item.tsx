import * as React from 'react';
import './legacy-namespace-item.scss';

import {
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
} from '@patternfly/react-core';

import { Link } from 'react-router-dom';

import { Paths, formatPath } from 'src/paths';
import { Logo } from 'src/components';

import { LegacyNamespaceDetailType } from 'src/api/response-types/legacy-namespace';

interface LegacyNamespaceProps {
  namespace: LegacyNamespaceDetailType;
}

export class LegacyNamespaceListItem extends React.Component<LegacyNamespaceProps> {
  render() {
    const { namespace } = this.props;
    const namespace_url = formatPath(Paths.legacyNamespace, {
      namespaceid: namespace.id,
    });

    const cells = [];

    cells.push(
      <DataListCell isFilled={false} alignRight={false} key='ns'>
        <Logo
          alt='logo'
          fallbackToDefault
          image={namespace.avatar_url}
          size='40px'
          unlockWidth
          width='97px'
        ></Logo>
      </DataListCell>,
    );

    cells.push(
      <DataListCell key='content'>
        <div>
          <Link to={namespace_url}>{namespace.name}</Link>
        </div>
      </DataListCell>,
    );

    return (
      <DataListItem data-cy='LegacyNamespaceListItem'>
        <DataListItemRow>
          <DataListItemCells dataListCells={cells} />
        </DataListItemRow>
      </DataListItem>
    );
  }
}
