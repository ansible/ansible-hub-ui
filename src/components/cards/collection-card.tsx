import { Trans, t } from '@lingui/macro';
import {
  Badge,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Text,
  TextContent,
  TextVariants,
  Tooltip,
} from '@patternfly/react-core';
import cx from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { CollectionVersionSearch } from 'src/api';
import { CollectionNumericLabel, Logo, SignatureBadge } from 'src/components';
import { Constants } from 'src/constants';
import { useContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import { convertContentSummaryCounts } from 'src/utilities';

interface IProps extends CollectionVersionSearch {
  className?: string;
  displaySignatures: boolean;
  footer?: React.ReactNode;
  menu?: React.ReactNode;
}

export const CollectionCard = ({
  collection_version,
  namespace_metadata: namespace,
  repository,
  is_signed,
  className,
  displaySignatures,
  menu,
  footer,
}: IProps) => {
  const { featureFlags } = useContext();
  const MAX_DESCRIPTION_LENGTH = 60;

  const company = namespace?.company || collection_version.namespace;
  const contentSummary = convertContentSummaryCounts(collection_version);

  return (
    <Card className={cx('hub-c-card-collection-container ', className)}>
      <CardHeader className='logo-row'>
        <Logo
          alt={t`${company} logo`}
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
                    {repository.name === Constants.CERTIFIED_REPO
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
                  {company}
                </Link>
              </Trans>
            </Text>
          </TextContent>
        </div>
      </CardHeader>
      <CardBody>
        <Tooltip content={<div>{collection_version.description}</div>}>
          <div className='description'>
            {getDescription(
              collection_version.description,
              MAX_DESCRIPTION_LENGTH,
            )}
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

function getDescription(d: string, MAX_DESCRIPTION_LENGTH) {
  if (!d) {
    return '';
  }
  if (d.length > MAX_DESCRIPTION_LENGTH) {
    return d.slice(0, MAX_DESCRIPTION_LENGTH) + '...';
  } else {
    return d;
  }
}

function renderTypeCount(type, count) {
  return (
    <div key={type}>
      <CollectionNumericLabel count={count} newline type={type} />
    </div>
  );
}
