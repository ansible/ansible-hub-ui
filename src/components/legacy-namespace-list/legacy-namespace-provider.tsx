import { Trans } from '@lingui/macro';
import { Text, TextContent, TextVariants } from '@patternfly/react-core';
import React from 'react';
import { Link } from 'react-router-dom';

interface IProps {
  id: number;
  name: string;
  url: string;
}

export class ProviderLink extends React.Component<IProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { name, url } = this.props;

    return (
      <TextContent>
        <Text component={TextVariants.small}>
          <Trans>
            Provided by <Link to={url}>{name}</Link>
          </Trans>
        </Text>
      </TextContent>
    );
  }
}
