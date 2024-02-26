import { Trans, t } from '@lingui/macro';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Text,
  TextContent,
  TextVariants,
  Tooltip,
} from '@patternfly/react-core';
import ArrowRightIcon from '@patternfly/react-icons/dist/esm/icons/arrow-right-icon';
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CollectionVersionSearch } from 'src/api';
import { CollectionNumericLabel, Logo, SignatureBadge } from 'src/components';
import { useHubContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import { convertContentSummaryCounts, namespaceTitle } from 'src/utilities';

interface IProps extends CollectionVersionSearch {
  displaySignatures: boolean;
  footer?: ReactNode;
  menu?: ReactNode;
}

export const CollectionNextPageCard = ({
  onClick,
}: {
  onClick: () => void;
}) => {
  return (
    <Card className='hub-c-card-collection-container'>
      <div
        style={{
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
        }}
      >
        <Button variant='link' onClick={onClick}>
          {t`View more`}
          <br />
          <br />
          <ArrowRightIcon />
        </Button>
      </div>
    </Card>
  );
};

export const CollectionCard = ({
  collection_version,
  namespace_metadata: namespace,
  repository,
  is_signed,
  displaySignatures,
  menu,
  footer,
}: IProps) => {
  const { featureFlags } = useHubContext();

  const nsTitle = namespaceTitle(
    namespace || { name: collection_version.namespace },
  );
  const contentSummary = convertContentSummaryCounts(collection_version);

  return (
    <Card className='hub-c-card-collection-container'>
      <CardHeader className='logo-row'>
        <Logo
          alt={t`${nsTitle} logo`}
          fallbackToDefault
          image={namespace?.avatar_url}
          size='40px'
          unlockWidth
          flexGrow
        />
        <div className='card-badge-area'>
          {featureFlags.display_repositories ? (
            <TextContent>
              <Text component={TextVariants.small}>
                <Badge isRead>
                  <Link
                    to={formatPath(Paths.ansibleRepositoryDetail, {
                      name: repository.name,
                    })}
                  >
                    {repository.name ===
                    (IS_INSIGHTS ? 'published' : 'rh-certified')
                      ? t`Certified`
                      : repository.name}
                  </Link>
                </Badge>
              </Text>
            </TextContent>
          ) : null}
          {displaySignatures ? (
            <SignatureBadge
              isCompact
              signState={is_signed ? 'signed' : 'unsigned'}
            />
          ) : null}
        </div>
        {menu}
      </CardHeader>
      <CardHeader>
        <div className='name'>
          <Link
            to={formatPath(Paths.collectionByRepo, {
              collection: collection_version.name,
              namespace: collection_version.namespace,
              repo: repository.name,
            })}
          >
            {collection_version.name}
          </Link>
        </div>
        <div className='author'>
          <TextContent>
            <Text component={TextVariants.small}>
              <Trans>
                Provided by&nbsp;
                <Link
                  to={formatPath(Paths.namespaceDetail, {
                    namespace: collection_version.namespace,
                  })}
                >
                  {nsTitle}
                </Link>
              </Trans>
            </Text>
          </TextContent>
        </div>
      </CardHeader>
      <CardBody>
        <Tooltip content={<div>{collection_version.description}</div>}>
          <div className='description'>
            {getDescription(collection_version.description)}
          </div>
        </Tooltip>
      </CardBody>
      <CardBody className='type-container'>
        {Object.keys(contentSummary.contents).map((k) =>
          renderTypeCount(k, contentSummary.contents[k]),
        )}
      </CardBody>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
};

// FIXME: pf-m-truncate / hub-m-truncated
function getDescription(d: string, MAX_DESCRIPTION_LENGTH = 60) {
  if (!d) {
    return '';
  }

  if (d.length > MAX_DESCRIPTION_LENGTH) {
    return d.slice(0, MAX_DESCRIPTION_LENGTH) + '...';
  }

  return d;
}

function renderTypeCount(type, count) {
  return (
    <div key={type}>
      <CollectionNumericLabel count={count} newline type={type} />
    </div>
  );
}
