import { t } from '@lingui/macro';
import { List, ListItem } from '@patternfly/react-core';
import React from 'react';
import { Link } from 'react-router';
import { type CollectionVersion, type CollectionVersionSearch } from 'src/api';
import { EmptyStateNoData, HelpButton } from 'src/components';
import 'src/containers/collection-detail/collection-dependencies.scss';

interface IProps {
  collection: CollectionVersionSearch;
  dependencies_repos?: (CollectionVersion & {
    path?: string;
  })[];
}

export const CollectionDependenciesList = ({
  collection,
  dependencies_repos,
}: IProps) => {
  const { dependencies } = collection.collection_version;

  if (!Object.keys(dependencies).length) {
    return (
      <EmptyStateNoData
        title={t`No dependencies`}
        description={t`Collection does not have dependencies.`}
      />
    );
  }

  return (
    <List className='hub-c-list-dependencies'>
      {dependencies_repos.map((dependency, i) =>
        listDep(dependency, i, dependencies),
      )}
    </List>
  );
};

const listDep = (dependency, i, dependencies) => {
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
        {fqn}: {version_range}{' '}
        <HelpButton
          content={t`No version of ${fqn} exists that matches ${version_range}.`}
        />
      </ListItem>
    );
  }
};
