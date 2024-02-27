import { t } from '@lingui/macro';
import {
  Badge,
  Flex,
  FlexItem,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import React from 'react';
import { Link } from 'react-router-dom';
import { useHubContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';

interface IProps {
  isBreadcrumbContainer?: boolean;
  isFlexItem?: boolean;
  isTextContent?: boolean;
  name: string;
}

export const RepoSelector = ({
  isBreadcrumbContainer,
  isFlexItem,
  isTextContent,
  name,
}: IProps) => {
  const { featureFlags } = useHubContext();

  if (!featureFlags.display_repositories) {
    return null;
  }

  const repoName =
    {
      'rh-certified': t`Red Hat Certified`,
      community: t`Community`,
      published: IS_INSIGHTS ? t`Certified` : t`Published`,
      rejected: t`Rejected`,
      staging: t`Staging`,
      validated: t`Validated`,
    }[name] || name;

  const badge = (
    <Badge isRead title={name}>
      <Link to={formatPath(Paths.ansibleRepositoryDetail, { name })}>
        {repoName}
      </Link>
    </Badge>
  );

  // collection-card
  if (isTextContent) {
    return (
      <TextContent>
        <Text component={TextVariants.small}>{badge}</Text>
      </TextContent>
    );
  }

  // collection-list-item
  if (isFlexItem) {
    return <FlexItem>{badge}</FlexItem>;
  }

  // collection-header
  if (isBreadcrumbContainer) {
    return (
      <div className='hub-breadcrumb-container'>
        <Flex>
          <FlexItem>
            {t`Repository`}
            &nbsp; &nbsp;
            {badge}
          </FlexItem>
        </Flex>
      </div>
    );
  }

  return badge;
};
