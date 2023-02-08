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

export class CollectionCard extends React.Component<IProps> {
  MAX_DESCRIPTION_LENGTH = 60;

  render() {
    const {
      name,
      latest_version,
      namespace,
      className,
      displaySignatures,
      footer,
      repo,
      sign_state,
      menu,
    } = this.props;

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
          <TextContent>{this.getCertification(repo)}</TextContent>
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
              {this.getDescription(latest_version.metadata.description)}
            </div>
          </Tooltip>
        </CardBody>
        <CardBody className='type-container'>
          {Object.keys(contentSummary.contents).map((k) =>
            this.renderTypeCount(k, contentSummary.contents[k]),
          )}
        </CardBody>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    );
  }

  private getCertification(repo) {
    if (repo === Constants.CERTIFIED_REPO) {
      return (
        <Text component={TextVariants.small}>
          <Badge isRead>{t`Certified`}</Badge>
        </Text>
      );
    }

    return null;
  }

  private getDescription(d: string) {
    if (!d) {
      return '';
    }
    if (d.length > this.MAX_DESCRIPTION_LENGTH) {
      return d.slice(0, this.MAX_DESCRIPTION_LENGTH) + '...';
    } else {
      return d;
    }
  }

  private renderTypeCount(type, count) {
    return (
      <div key={type}>
        <CollectionNumericLabel count={count} newline type={type} />
      </div>
    );
  }
}
