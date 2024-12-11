import { t } from '@lingui/macro';
import { Button } from '@patternfly/react-core';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { AnsibleRepositoryAPI } from 'src/api';
import { Spinner, Tooltip } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { errorMessage } from 'src/utilities';

export const LazyRepositories = ({
  emptyText,
  remoteHref,
}: {
  emptyText?: string;
  remoteHref: string;
}) => {
  const [repositories, setRepositories] = useState([]);
  const [count, setCount] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const query = (prepend?) => {
    AnsibleRepositoryAPI.list({ remote: remoteHref, page, page_size: 10 })
      .then(({ data: { count, results } }) => {
        setRepositories(prepend ? [...prepend, ...results] : results);
        setCount(count);
        setError(null);
        setLoading(false);
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        setRepositories(prepend || []);
        setCount(null);
        setError(errorMessage(status, statusText));
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!remoteHref) {
      setRepositories([]);
      setCount(null);
      setPage(1);
      setError(null);
      setLoading(false);
      return;
    }

    setRepositories([]);
    setCount(null);
    setPage(1);
    setError(null);
    setLoading(true);

    query();
  }, [remoteHref]);

  // support pagination, but page == 1 is handled above
  useEffect(() => {
    if (page === 1) {
      return;
    }

    query(repositories);
  }, [page]);

  const errorElement = error && (
    <Tooltip content={t`Failed to load repositories: ${error}`} key='empty'>
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
      {repositories?.map?.(({ name }, index) => (
        <>
          {index ? ', ' : ''}
          <Link to={formatPath(Paths.ansibleRepositoryDetail, { name })}>
            {name}
          </Link>
        </>
      ))}
      {!repositories?.length ? (emptyText ?? '---') : null}
      {count > repositories?.length ? (
        <>
          {' '}
          <a onClick={loadMore}>(more)</a>
        </>
      ) : null}
    </>
  );
};
