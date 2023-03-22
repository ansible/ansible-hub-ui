import { t } from '@lingui/macro';
import React, { useEffect, useState } from 'react';
import { AnsibleRepositoryType, CollectionVersionAPI } from 'src/api';
import { Details } from 'src/components';
import { handleHttpError } from 'src/utilities';

interface TabProps {
  item: AnsibleRepositoryType;
  actionContext: { addAlert: (alert) => void; state: { params } };
}

export const CollectionVersionsTab = ({
  item,
  actionContext: { addAlert },
}: TabProps) => {
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    CollectionVersionAPI.list({ repository: item.name })
      .then(({ data: { data } }) => setVersions(data))
      .catch(
        handleHttpError(
          t`Failed to load collection versions`,
          () => setVersions([]),
          addAlert,
        ),
      );
  }, []);

  return <Details item={versions} />;
};
