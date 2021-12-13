import { t } from '@lingui/macro';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { List, ListItem, ListVariant } from '@patternfly/react-core';

import { EmptyStateNoData } from 'src/components';

import { CollectionDetailType } from 'src/api';
import { formatPath, Paths } from 'src/paths';

import 'src/containers/collection-detail/collection-dependencies.scss';

interface IProps {
  collection: CollectionDetailType;
  repo: string;
}

export class CollectionDependenciesList extends React.Component<IProps> {
  render() {
    const { collection, repo } = this.props;

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
      <List variant={ListVariant.inline} className='dependencies-list'>
        {Object.keys(dependencies).map((dependency, i) => (
          <ListItem key={i} style={{ marginRight: '70px' }}>
            <Link
              to={formatPath(
                Paths.collectionByRepo,
                {
                  collection: this.splitDependencyName(dependency).collection,
                  namespace: this.splitDependencyName(dependency).namespace,
                  repo,
                },
                this.separateVersion(dependencies[dependency]),
              )}
            >
              {this.splitDependencyName(dependency).collection}
            </Link>
          </ListItem>
        ))}
      </List>
    );
  }

  private splitDependencyName(dependency) {
    const [namespace, collection] = dependency.split('.');
    return { namespace, collection };
  }

  private separateVersion(version) {
    const v = version.match(/((\d+\.*)+)/);
    return v ? { version: v[0] } : {};
  }
}
