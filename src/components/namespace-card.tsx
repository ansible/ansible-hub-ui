import { t } from '@lingui/core/macro';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@patternfly/react-core';
import ArrowRightIcon from '@patternfly/react-icons/dist/esm/icons/arrow-right-icon';
import { Link } from 'react-router-dom';
import { Logo, Tooltip } from 'src/components';
import { Paths, formatPath } from 'src/paths';
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
  showDetailLink?: boolean;
}

export const NamespaceNextPageCard = ({ onClick }: { onClick: () => void }) => {
  return (
    <Card className='hub-c-card-ns-container'>
      <div
        style={{
          display: 'flex',
          height: IS_INSIGHTS ? '216px' : '168px',
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

export const NamespaceCard = ({ namespace, showDetailLink }: IProps) => {
  const { avatar_url, name } = namespace;
  const title = namespaceTitle(namespace);

  return (
    <Card className='hub-c-card-ns-container'>
      <CardHeader>
        <div style={{ display: 'flex', justifyContent: 'start' }}>
          <Logo
            alt={t`${title} logo`}
            fallbackToDefault
            image={avatar_url}
            size='40px'
            unlockWidth
          />
        </div>
      </CardHeader>
      <Tooltip content={title} noSpan>
        <CardTitle>{getDescription(title)}</CardTitle>
      </Tooltip>
      {title !== name ? (
        <Tooltip content={name} noSpan>
          <CardBody>{getDescription(name)}</CardBody>
        </Tooltip>
      ) : null}

      {showDetailLink ? (
        <CardFooter>
          <Link
            to={formatPath(Paths.namespaceDetail, {
              namespace: name,
            })}
          >{t`View collections`}</Link>
        </CardFooter>
      ) : null}
    </Card>
  );
};

// FIXME: pf-m-truncate / hub-m-truncated
function getDescription(d: string, MAX_DESCRIPTION_LENGTH = 26) {
  if (!d) {
    return '';
  }

  if (d.length > MAX_DESCRIPTION_LENGTH) {
    return d.slice(0, MAX_DESCRIPTION_LENGTH) + '...';
  }

  return d;
}
