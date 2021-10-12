import { t } from '@lingui/macro';
import * as React from 'react';
import './cards.scss';

import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardHeaderMain,
  CardTitle,
  Tooltip,
} from '@patternfly/react-core';

import { Link } from 'react-router-dom';

import { Logo } from 'src/components';
// Use snake case to match field types provided py python API so that the
// spread operator can be used.
interface IProps {
  avatar_url: string;
  name: string;
  company: string;
  namespaceURL?: string;
}

export class NamespaceCard extends React.Component<IProps, {}> {
  MAX_DESCRIPTION_LENGTH = 26;
  render() {
    const { avatar_url, name, company, namespaceURL } = this.props;
    return (
      <Card className='ns-card-container'>
        <CardHeader>
          <CardHeaderMain>
            <Logo
              alt={t`${company} logo`}
              fallbackToDefault
              image={avatar_url}
              size='40px'
              unlockWidth
            />
          </CardHeaderMain>
        </CardHeader>
        <Tooltip content={company || name}>
          <CardTitle>{this.getDescription(company || name)}</CardTitle>
        </Tooltip>
        <Tooltip content={name}>
          <CardBody>{this.getDescription(name)}</CardBody>
        </Tooltip>

        {namespaceURL && (
          <CardFooter>
            <Link to={namespaceURL}>{t`View collections`}</Link>
          </CardFooter>
        )}
      </Card>
    );
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
}
