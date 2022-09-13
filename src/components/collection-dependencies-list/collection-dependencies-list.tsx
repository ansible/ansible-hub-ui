import { t } from '@lingui/macro';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { List, ListItem, ListVariant } from '@patternfly/react-core';

import { EmptyStateNoData, HelperText } from 'src/components';

import { CollectionDetailType, CollectionVersion } from 'src/api';

import 'src/containers/collection-detail/collection-dependencies.scss';

interface IProps {
  collection: CollectionDetailType;
  dependencies_repos: (CollectionVersion & { path?: string })[];
}

export class CollectionDependenciesList extends React.Component<IProps> {
  render() {
    const { collection, dependencies_repos } = this.props;
    const { dependencies } = collection.latest_version.metadata;

    if (!Object.keys(dependencies).length) {
      return (
        <EmptyStateNoData
          title={t`No dependencies`}
          description={t`Collection does not have dependencies.`}
        />
      );
    }

    return (
      <List variant={ListVariant.inline} className='hub-c-list-dependencies'>
        {dependencies_repos.map((dependency, i) => (
          <>
            {dependency.path && (
              <ListItem key={i} style={{ marginRight: '70px' }}>
                <Link to={dependency.path}>{dependency.name}</Link>
              </ListItem>
            )}

            {!dependency.path && (
              <ListItem key={i} style={{ marginRight: '70px' }}>
                {dependency.name}
                <HelperText
                  content={t`Collection was not found in the system. You must upload it.`}
                />
              </ListItem>
            )}
          </>
        ))}
      </List>
    );
  }
}
