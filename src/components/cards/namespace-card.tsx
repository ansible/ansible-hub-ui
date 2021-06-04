import * as React from 'react';
import './cards.scss';

import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardHeaderMain,
  CardTitle,
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
  render() {
    const { avatar_url, name, company, namespaceURL } = this.props;
    return (
      <Card className='ns-card-container'>
        <CardHeader>
          <CardHeaderMain>
            <Logo
              unlockWidth
              image={avatar_url}
              alt={company + ' logo'}
              size='50px'
            />
          </CardHeaderMain>
        </CardHeader>
        <CardTitle className={'wrap'}>{company || name}</CardTitle>
        <CardBody className={'wrap'}>{name}</CardBody>
        {namespaceURL && (
          <CardFooter className={'wrap'}>
            <Link to={namespaceURL}>View collections</Link>
          </CardFooter>
        )}
      </Card>
    );
  }
}
