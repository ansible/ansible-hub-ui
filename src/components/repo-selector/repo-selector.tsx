import { t } from '@lingui/macro';
import {
  Flex,
  FlexItem,
  InputGroup,
  InputGroupText,
} from '@patternfly/react-core';
import React from 'react';

interface IProps {
  selectedRepo: string;
}

export const RepoSelector = ({ selectedRepo }: IProps) => {
  const repoName =
    {
      community: t`Community`,
      published: t`Published`,
      rejected: t`Rejected`,
      'rh-certified': t`Red Hat Certified`,
      staging: t`Staging`,
      validated: t`Validated`,
    }[selectedRepo] || selectedRepo;

  return (
    <Flex>
      <FlexItem>
        <InputGroup>
          <InputGroupText style={{ paddingLeft: 0 }} variant='plain'>
            {t`Repository`}
          </InputGroupText>
          <InputGroupText
            variant='plain'
            style={{
              backgroundColor: 'var(--pf-global--disabled-color--300)',
              color: 'var(--pf-global--Color--100)',
              height: '36px',
            }}
          >
            {repoName}
          </InputGroupText>
        </InputGroup>
      </FlexItem>
    </Flex>
  );
};
