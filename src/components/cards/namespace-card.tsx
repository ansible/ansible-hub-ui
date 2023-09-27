import { t } from '@lingui/macro';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardHeaderMain,
  CardTitle,
  Tooltip,
} from '@patternfly/react-core';
import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from 'src/components';
import { namespaceTitle } from 'src/utilities';
import './cards.scss';

// Use snake case to match field types provided py python API so that the
// spread operator can be used.
interface IProps {
  namespace: {
    avatar_url: string;
    name: string;
    company: string;
  };
  namespaceURL?: string;
}

export const NamespaceCard = ({ namespace, namespaceURL }: IProps) => {
  const { avatar_url, name } = namespace;
  const title = namespaceTitle(namespace);

  const MAX_DESCRIPTION_LENGTH = 26;
  return (
    <Card className='hub-c-card-ns-container'>
      <CardHeader>
        <CardHeaderMain>
          <Logo
            alt={t`${title} logo`}
            fallbackToDefault
            image={avatar_url}
            size='40px'
            unlockWidth
          />
        </CardHeaderMain>
      </CardHeader>
      <Tooltip content={title}>
        <CardTitle>{getDescription(title, MAX_DESCRIPTION_LENGTH)}</CardTitle>
      </Tooltip>
      {title !== name ? (
        <Tooltip content={name}>
          <CardBody>{getDescription(name, MAX_DESCRIPTION_LENGTH)}</CardBody>
        </Tooltip>
      ) : null}

      {namespaceURL && (
        <CardFooter>
          <Link to={namespaceURL}>{t`View collections`}</Link>
        </CardFooter>
      )}
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
