import { t } from '@lingui/macro';
import { Button, Spinner, Tooltip } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import React, { useEffect, useState } from 'react';
import { AnsibleDistributionAPI } from 'src/api';
import { errorMessage } from 'src/utilities';

export const LazyDistributions = ({
  emptyText,
  onLoad,
  repositoryHref,
}: {
  emptyText?: string;
  onLoad?: (distributions) => void;
  repositoryHref: string;
}) => {
  const [distributions, setDistributions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!repositoryHref) {
      setDistributions([]);
      setError(null);
      setLoading(false);
      onLoad?.([]);
      return;
    }

    setDistributions([]);
    setError(null);
    setLoading(true);

    AnsibleDistributionAPI.list({ repository: repositoryHref })
      .then(({ data }) => {
        setDistributions(data.results);
        setError(null);
        setLoading(false);
        onLoad?.(data.results);
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        setDistributions([]);
        setError(errorMessage(status, statusText));
        setLoading(false);
        onLoad?.([]);
      });
  }, [repositoryHref]);

  const errorElement = error && (
    <Tooltip content={t`Failed to load distributions: ${error}`} key='empty'>
      <Button variant='plain'>
        <ExclamationCircleIcon />
      </Button>
    </Tooltip>
  );

  return loading ? (
    <Spinner size='sm' />
  ) : error ? (
    errorElement
  ) : (
    <>
      {distributions?.map?.(({ name }) => name)?.join?.(', ') ||
        (emptyText ?? '---')}
    </>
  );
};
