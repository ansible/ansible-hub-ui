import { Trans, t } from '@lingui/macro';
import {
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  LabelGroup,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { CollectionVersionSearch } from 'src/api';
import {
  CollectionNumericLabel,
  DateComponent,
  DeprecatedTag,
  Logo,
  Tag,
} from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { chipGroupProps, convertContentSummaryCounts } from 'src/utilities';
import { SignatureBadge } from '../signing';
import './list-item.scss';

interface IProps extends CollectionVersionSearch {
  showNamespace?: boolean;
  controls?: React.ReactNode;
  displaySignatures: boolean;
}

export const CollectionListItem = ({
  collection_version,
  namespace_metadata: namespace,
  repository,
  is_signed,
  is_deprecated,
  displaySignatures,
  showNamespace,
  controls,
}: IProps) => {
  const cells = [];

  // FIXME: remove when API switch to AnsibleNamespaceMetadata
  const mockNamespace = {
    pulp_href: '',
    name: collection_version.namespace,
    company: 'xaz',
    description: 'foo bar',
    avatar: '',
    avatar_url: '',
    email: 'foo',
  };
  namespace = mockNamespace;

  const company = namespace.company || namespace.name;

  if (showNamespace) {
    cells.push(
      <DataListCell isFilled={false} alignRight={false} key='ns'>
        <Logo
          alt={t`${company} logo`}
          fallbackToDefault
          image={namespace.avatar_url}
          size='40px'
          unlockWidth
          width='97px'
        />
      </DataListCell>,
    );
  }

  const contentSummary = convertContentSummaryCounts(collection_version);

  cells.push(
    <DataListCell key='content'>
      <div>
        <Link
          to={formatPath(Paths.collectionByRepo, {
            collection: collection_version.name,
            namespace: namespace.name,
            repo: repository.name,
          })}
          data-cy='CollectionList-name'
        >
          {collection_version.name}
        </Link>
        {is_deprecated && <DeprecatedTag />}
        {showNamespace ? (
          <TextContent>
            <Text component={TextVariants.small}>
              <Trans>
                Provided by&nbsp;
                <Link
                  to={formatPath(
                    // TODO: repository detail page
                    Paths.ansibleRepositoryDetail,
                    {
                      name: repository.name,
                    },
                  )}
                >
                  {repository.name}
                </Link>
                /
                <Link
                  to={formatPath(Paths.namespaceByRepo, {
                    repo: repository.name,
                    namespace: namespace.name,
                  })}
                >
                  {company}
                </Link>
              </Trans>
            </Text>
          </TextContent>
        ) : null}
      </div>
      <div className='hub-entry'>{collection_version.description}</div>
      <div className='hub-entry pf-l-flex pf-m-wrap'>
        {Object.keys(contentSummary.contents).map((type) => (
          <div key={type}>
            <CollectionNumericLabel
              count={contentSummary.contents[type]}
              type={type}
            />
          </div>
        ))}
      </div>
      <div className='hub-entry pf-l-flex pf-m-wrap'>
        <LabelGroup {...chipGroupProps()}>
          {collection_version.tags.map((tag, index) => (
            <Tag key={index}>{tag.name}</Tag>
          ))}
        </LabelGroup>
      </div>
    </DataListCell>,
  );

  cells.push(
    <DataListCell isFilled={false} alignRight key='stats'>
      {controls ? <div className='hub-entry'>{controls}</div> : null}
      <div className='hub-right-col hub-entry'>
        <Trans>
          Updated <DateComponent date={collection_version.pulp_created} />
        </Trans>
      </div>
      <div className='hub-entry'>v{collection_version.version}</div>
      {displaySignatures ? (
        <SignatureBadge
          className='hub-entry'
          signState={is_signed ? 'signed' : 'unsigned'}
        />
      ) : null}
    </DataListCell>,
  );

  return (
    <DataListItem data-cy='CollectionListItem'>
      <DataListItemRow>
        <DataListItemCells dataListCells={cells} />
      </DataListItemRow>
    </DataListItem>
  );
};
