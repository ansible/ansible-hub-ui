import { t } from '@lingui/macro';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AnsibleRemoteAPI,
  AnsibleRemoteType,
  AnsibleRepositoryType,
} from 'src/api';
import { Details, LazyDistributions, PulpLabels } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { parsePulpIDFromURL } from 'src/utilities';

interface TabProps {
  item: AnsibleRepositoryType;
  actionContext: { addAlert: (alert) => void; state: { params } };
}

export const DetailsTab = ({ item }: TabProps) => {
  const [remote, setRemote] = useState<AnsibleRemoteType>(null);

  useEffect(() => {
    const pk = item.remote && parsePulpIDFromURL(item.remote);
    if (pk) {
      AnsibleRemoteAPI.get(pk).then(({ data }) => setRemote(data));
    } else {
      setRemote(null);
    }
  }, [item.remote]);

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
          value: <LazyDistributions repositoryHref={item.pulp_href} />,
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
          value: remote ? (
            <Link
              to={formatPath(Paths.ansibleRemoteDetail, { name: remote.name })}
            >
              {remote.name}
            </Link>
          ) : (
            t`None`
          ),
        },
      ]}
    />
  );
};
