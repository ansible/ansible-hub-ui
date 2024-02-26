import { t } from '@lingui/macro';
import {
  Flex,
  FlexItem,
  InputGroup,
  InputGroupText,
} from '@patternfly/react-core';
import React from 'react';
import { useHubContext } from 'src/loaders/app-context';

interface IProps {
  selectedRepo: string;
}

export const RepoSelector = ({ selectedRepo }: IProps) => {
  const { featureFlags } = useHubContext();

  if (IS_INSIGHTS) {
    return null;
  }
  if (!featureFlags.display_repositories) {
    return null;
  }

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
    <div className='breadcrumb-container'>
      <Flex>
        <FlexItem>
          <InputGroup>
            <InputGroupText style={{ paddingLeft: 0 }}>
              {t`Repository`}
            </InputGroupText>
            <InputGroupText
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
    </div>
  );
};
