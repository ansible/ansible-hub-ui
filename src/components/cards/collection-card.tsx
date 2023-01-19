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
import { CollectionListType } from 'src/api';
import { CollectionNumericLabel, Logo, SignatureBadge } from 'src/components';
import { Constants } from 'src/constants';
import { Paths, formatPath } from 'src/paths';
import { convertContentSummaryCounts } from 'src/utilities';

interface IProps extends CollectionListType {
  className?: string;
  displaySignatures: boolean;
  footer?: React.ReactNode;
  repo?: string;
  menu?: React.ReactNode;
}

export const CollectionCard = ({
  name,
  latest_version,
  namespace,
  className,
  displaySignatures,
  footer,
  repo,
  sign_state,
  menu,
}: IProps) => {
  const MAX_DESCRIPTION_LENGTH = 60;

  const company = namespace.company || namespace.name;
  const contentSummary = convertContentSummaryCounts(latest_version.metadata);

  return (
    <Card className={cx('hub-c-card-collection-container ', className)}>
      <CardHeader className='logo-row'>
        <Logo
          alt={t`${company} logo`}
          fallbackToDefault
          image={namespace.avatar_url}
          size='40px'
          unlockWidth
          flexGrow
        />
        <TextContent>{getCertification(repo)}</TextContent>
        {displaySignatures ? (
          <SignatureBadge isCompact signState={sign_state} />
        ) : null}
        {menu}
      </CardHeader>
      <CardHeader>
        <div className='name'>
          <Link
            to={formatPath(Paths.collectionByRepo, {
              collection: name,
              namespace: namespace.name,
              repo: repo,
            })}
          >
            {name}
          </Link>
        </div>
        <div className='author'>
          <TextContent>
            <Text component={TextVariants.small}>
              <Trans>Provided by {company}</Trans>
            </Text>
          </TextContent>
        </div>
      </CardHeader>
      <CardBody>
        <Tooltip content={<div>{latest_version.metadata.description}</div>}>
          <div className='description'>
            {getDescription(
              latest_version.metadata.description,
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

function getCertification(repo) {
  if (repo === Constants.CERTIFIED_REPO) {
    return (
      <Text component={TextVariants.small}>
        <Badge isRead>{t`Certified`}</Badge>
      </Text>
    );
  }

  return null;
}

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
