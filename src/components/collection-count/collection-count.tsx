import { t } from '@lingui/macro';
import { Spinner } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { CollectionAPI, CollectionExcludesType } from 'src/api';
import { AlertType } from 'src/components';
import { errorMessage } from 'src/utilities';

interface IProps {
  distributionPath: string;
}

export const CollectionCount = ({ distributionPath }: IProps) => {
  const [collectionCount, setCollectionCount] = useState(null);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);

  const getCollectionCount = (repo) => {
    const promises = [];
    promises.push(
      CollectionAPI.getPublishedCount(repo).then((count) => {
        return count;
      }),
    );
    promises.push(
      CollectionAPI.getExcludesCount(repo).then(
        (results: CollectionExcludesType) => {
          const excludedCollections = results.collections;
          const count = excludedCollections.length;
          return count;
        },
      ),
    );

    Promise.all(promises)
      .then((results) => {
        const count = results[0] - results[1];
        setCollectionCount(count);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        const { status, statusText } = err.response;
        addAlert(
          t`Collection count for "${distributionPath}" could not be displayed.`,
          'danger',
          errorMessage(status, statusText),
          setAlerts,
          alerts,
        );
      });
  };

  useEffect(() => {
    getCollectionCount(distributionPath);
  }, []);

  return !loading ? <>{collectionCount}</> : <Spinner size='sm' />;
};

function addAlert(title, variant, description, setAlerts, alerts) {
  setAlerts([
    ...alerts,
    {
      description,
      title,
      variant,
    },
  ]);
}
