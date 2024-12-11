import { t } from '@lingui/core/macro';
import { Button } from '@patternfly/react-core';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import React, { useEffect, useState } from 'react';
import { AnsibleDistributionAPI } from 'src/api';
import { Spinner, Tooltip } from 'src/components';
import { errorMessage } from 'src/utilities';

export const LazyDistributions = ({
  emptyText,
  repositoryHref,
}: {
  emptyText?: string;
  repositoryHref: string;
}) => {
  const [distributions, setDistributions] = useState([]);
  const [count, setCount] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const query = (prepend?) => {
    AnsibleDistributionAPI.list({
      repository: repositoryHref,
      sort: 'pulp_created',
      page,
      page_size: 10,
    })
      .then(({ data: { count, results } }) => {
        setDistributions(prepend ? [...prepend, ...results] : results);
        setCount(count);
        setError(null);
        setLoading(false);
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        setDistributions(prepend || []);
        setCount(null);
        setError(errorMessage(status, statusText));
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!repositoryHref) {
      setDistributions([]);
      setCount(null);
      setPage(1);
      setError(null);
      setLoading(false);
      return;
    }

    setDistributions([]);
    setCount(null);
    setPage(1);
    setError(null);
    setLoading(true);

    query();
  }, [repositoryHref]);

  // support pagination, but page == 1 is handled above
  useEffect(() => {
    if (page === 1) {
      return;
    }

    query(distributions);
  }, [page]);

  const errorElement = error && (
    <Tooltip content={t`Failed to load distributions: ${error}`} key='empty'>
      <Button variant='plain'>
        <ExclamationCircleIcon />
      </Button>
    </Tooltip>
  );

  const loadMore = () => {
    setPage((page) => page + 1);
  };

  return loading ? (
    <Spinner size='sm' />
  ) : error ? (
    errorElement
  ) : (
    <>
      {distributions?.map?.(({ name }) => name)?.join?.(', ') ||
        (emptyText ?? '---')}
      {count > distributions?.length ? (
        <>
          {' '}
          <a onClick={loadMore}>(more)</a>
        </>
      ) : null}
    </>
  );
};
