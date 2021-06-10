import * as React from 'react';
import './cards.scss';

import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardHeaderMain,
  CardTitle,
  Label,
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
  editable?: boolean;
}

export class NamespaceCard extends React.Component<IProps, {}> {
  render() {
    const { avatar_url, name, company, namespaceURL, editable } = this.props;

    const heading = company || name;
    const body = name;

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
        <CardTitle>
          {namespaceURL ? <Link to={namespaceURL}>{heading}</Link> : heading}
        </CardTitle>
        <CardBody>{body}</CardBody>
        <CardFooter>
          {editable && <Label>My namespace</Label>}
          {editable || (
            <span style={{ display: 'inline-block', height: '22px' }}></span>
          ) /* constant footer height */}
        </CardFooter>
      </Card>
    );
  }
}
