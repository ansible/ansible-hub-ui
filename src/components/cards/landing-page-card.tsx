import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import * as React from 'react';

interface IProps {
  title: string;
  body: string;
}

export const LandingPageCard = ({ title, body }: IProps) => {
  return (
    <React.Fragment>
      <Card className='landing-page-card'>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardBody>{body}</CardBody>
      </Card>
    </React.Fragment>
  );
};
