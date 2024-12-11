import { t } from '@lingui/macro';
import React from 'react';
import { Link } from 'react-router';
import { type AnsibleRemoteType, type AnsibleRepositoryType } from 'src/api';
import {
  CopyURL,
  Details,
  LazyDistributions,
  PulpLabels,
} from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { getRepoURL } from 'src/utilities';

interface TabProps {
  item: AnsibleRepositoryType & {
    distroBasePath?: string;
    remote?: AnsibleRemoteType;
  };
  actionContext: { addAlert: (alert) => void; state: { params } };
}

export const DetailsTab = ({ item }: TabProps) => {
  return (
    <Details
      fields={[
        { label: t`Repository name`, value: item?.name },
        { label: t`Description`, value: item?.description || t`None` },
        {
          label: t`Retained version count`,
          value: item?.retain_repo_versions ?? t`All`,
        },
        {
          label: t`Distribution`,
          value: <LazyDistributions repositoryHref={item?.pulp_href} />,
        },
        {
          label: t`Repository URL`,
          value: item?.distroBasePath ? (
            <CopyURL url={getRepoURL(item.distroBasePath)} />
          ) : (
            '---'
          ),
        },
        {
          label: t`Labels`,
          value: <PulpLabels labels={item?.pulp_labels} />,
        },
        {
          label: t`Private`,
          value: item?.private ? t`Yes` : t`No`,
        },
        {
          label: t`Remote`,
          value: item?.remote ? (
            <Link
              to={formatPath(Paths.ansibleRemoteDetail, {
                name: item?.remote.name,
              })}
            >
              {item?.remote.name}
            </Link>
          ) : (
            t`None`
          ),
        },
      ]}
    />
  );
};
