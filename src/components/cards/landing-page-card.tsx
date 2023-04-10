import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import * as React from 'react';

interface IProps {
  title: string;
  body: string;
}

export const LandingPageCard = ({ title, body }: IProps) => {
  return (
    <Card
      className='landing-page-card'
      style={{ margin: '0 0 24px 24px', flex: '30%' }}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody>{body}</CardBody>
    </Card>
  );
};
