import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import cx from 'classnames';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  TextContent,
  Text,
  TextVariants,
  Badge,
  Tooltip,
} from '@patternfly/react-core';

import { AppContext } from 'src/loaders/app-context';

import { Link } from 'react-router-dom';

import { CollectionNumericLabel, Logo, SignatureBadge } from 'src/components';
import { CollectionListType } from 'src/api';
import { formatPath, Paths } from 'src/paths';
import { convertContentSummaryCounts } from 'src/utilities';
import { Constants } from 'src/constants';

interface IProps extends CollectionListType {
  className?: string;
  footer?: React.ReactNode;
  repo?: string;
  menu?: React.ReactNode;
}

export class CollectionCard extends React.Component<IProps> {
  MAX_DESCRIPTION_LENGTH = 60;
  static contextType = AppContext;

  render() {
    const {
      name,
      latest_version,
      namespace,
      className,
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
          <SignatureBadge isCompact signState={sign_state} />
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
    const { latest_version } = this.props;
    const fingerprints =
      this.context?.settings.SIGNATURE_FINGERPRINT_LABELS || {};

    for (const i of Object.keys(fingerprints)) {
      for (const signature of latest_version.metadata.signatures) {
        if (fingerprints[i].includes(signature.pubkey_fingerprint)) {
          return (
            <Text component={TextVariants.small}>
              <Badge isRead>{i}</Badge>
            </Text>
          );
        }
      }
    }

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
