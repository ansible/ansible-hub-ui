import { t } from '@lingui/macro';
import { List, ListItem, ListVariant } from '@patternfly/react-core';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { CollectionDetailType, CollectionVersion } from 'src/api';
import { EmptyStateNoData, HelperText } from 'src/components';
import 'src/containers/collection-detail/collection-dependencies.scss';

interface IProps {
  collection: CollectionDetailType;
  dependencies_repos: (CollectionVersion & {
    path?: string;
  })[];
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
        {dependencies_repos.map((dependency, i) =>
          this.listDep(dependency, i, dependencies),
        )}
      </List>
    );
  }

  private listDep(dependency, i, dependencies) {
    const fqn = dependency.namespace + '.' + dependency.name;
    const version_range = dependencies[fqn];

    if (dependency.path) {
      return (
        <ListItem key={i} style={{ marginRight: '70px' }}>
          <Link to={dependency.path}>{fqn}</Link>: {version_range}
        </ListItem>
      );
    } else {
      return (
        <ListItem key={i} style={{ marginRight: '70px' }}>
          {fqn}: {version_range}
          <HelperText
            content={t`No version of ${fqn} exists that matches ${version_range}.`}
          />
        </ListItem>
      );
    }
  }
}
