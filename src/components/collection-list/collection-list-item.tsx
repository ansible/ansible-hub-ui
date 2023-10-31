import { Trans, t } from '@lingui/macro';
import {
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Flex,
  FlexItem,
  Label,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import React from 'react';
import { Link } from 'react-router-dom';
import { CollectionVersionSearch } from 'src/api';
import {
  CollectionNumericLabel,
  DateComponent,
  DeprecatedTag,
  LabelGroup,
  Logo,
  Tag,
} from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { convertContentSummaryCounts } from 'src/utilities';
import { SignatureBadge } from '../signing';
import './list-item.scss';

interface IProps {
  collection: CollectionVersionSearch;
  displaySignatures: boolean;
  dropdownMenu?: React.ReactNode | null;
  showNamespace?: boolean;
  uploadButton?: React.ReactNode | null;
}

export const CollectionListItem = ({
  collection: {
    collection_version,
    namespace_metadata: namespace,
    repository,
    is_signed,
    is_deprecated,
  },
  displaySignatures,
  dropdownMenu,
  showNamespace,
  uploadButton,
}: IProps) => {
  const cells = [];

  const company = namespace?.company || collection_version.namespace;

  if (showNamespace) {
    cells.push(
      <DataListCell isFilled={false} alignRight={false} key='ns'>
        <Logo
          alt={t`${company} logo`}
          fallbackToDefault
          image={namespace?.avatar_url}
          size='130px'
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
            namespace: collection_version.namespace,
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
                  to={formatPath(Paths.namespaceDetail, {
                    namespace: collection_version.namespace,
                  })}
                >
                  {company}
                </Link>
              </Trans>
            </Text>
          </TextContent>
        ) : null}
      </div>
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
        <LabelGroup>
          {collection_version.tags.map((tag, index) => (
            <Tag key={index}>{tag.name}</Tag>
          ))}
        </LabelGroup>
      </div>
    </DataListCell>,
  );

  const display_repositories = true; // no feature flag in 4.7
  cells.push(
    <DataListCell isFilled={false} alignRight key='stats'>
      <Flex
        direction={{ default: 'column' }}
        alignItems={{ default: 'alignItemsFlexEnd' }}
      >
        <Flex
          direction={{ default: 'column' }}
          alignItems={{ default: 'alignItemsFlexStart' }}
        >
          {uploadButton || dropdownMenu ? (
            <FlexItem>
              {uploadButton}
              {dropdownMenu || <span className='hidden-menu-space' />}
            </FlexItem>
          ) : null}
          <FlexItem>
            <div>
              <Trans>
                Updated <DateComponent date={collection_version.pulp_created} />
              </Trans>
            </div>
            <div>v{collection_version.version}</div>
          </FlexItem>
        </Flex>
        <Flex
          direction={{ default: 'row' }}
          alignSelf={{ default: 'alignSelfFlexStart' }}
        >
          {display_repositories ? (
            <FlexItem>
              <Label variant='outline'>
                <Link
                  to={formatPath(Paths.ansibleRepositoryDetail, {
                    name: repository.name,
                  })}
                >
                  {repository.name}
                </Link>
              </Label>
            </FlexItem>
          ) : null}
          {displaySignatures ? (
            <FlexItem>
              <SignatureBadge
                variant='outline'
                signState={is_signed ? 'signed' : 'unsigned'}
              />
            </FlexItem>
          ) : null}
        </Flex>
      </Flex>
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
