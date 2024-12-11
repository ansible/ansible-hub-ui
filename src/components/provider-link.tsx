import { Trans } from '@lingui/react/macro';
import { Text, TextContent, TextVariants } from '@patternfly/react-core';
import React from 'react';
import { Link } from 'react-router-dom';

interface IProps {
  name: string;
  url: string;
}

export function ProviderLink({ name, url }: IProps) {
  return url ? (
    <TextContent>
      <Text component={TextVariants.small}>
        <Trans>
          Provided by&nbsp;<Link to={url}>{name}</Link>
        </Trans>
      </Text>
    </TextContent>
  ) : null;
}
