import { Card, CardBody, CardHeader, Title } from '@patternfly/react-core';
import React from 'react';

interface IProps {
  title: string;
  body: React.ReactNode;
}

export const LandingPageCard = ({ title, body }: IProps) => {
  return (
    <Card
      className='landing-page-card'
      style={{
        margin: '0 0 24px 24px',
        flex: '30%',
        borderTop: '3px solid #39a5dc',
      }}
    >
      {' '}
      <div
        style={{
          border: 0,
          borderBottom: '1px solid #d1d1d1',
        }}
      >
        <CardHeader>
          <Title headingLevel='h1' size='2xl'>
            {title}
          </Title>
        </CardHeader>
      </div>
      <CardBody style={{ marginTop: '24px' }}>{body}</CardBody>
    </Card>
  );
};
