import { t } from '@lingui/macro';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardHeaderMain,
  CardTitle,
  Tooltip,
} from '@patternfly/react-core';
import ArrowRightIcon from '@patternfly/react-icons/dist/esm/icons/arrow-right-icon';
import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from 'src/components';
import { Constants } from 'src/constants';
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

export const NamespaceNextPageCard = ({ onClick }: { onClick: () => void }) => {
  return (
    <Card className='hub-c-card-ns-container'>
      <div
        style={{
          display: 'flex',
          height:
            DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE
              ? '216px'
              : '168px',
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
