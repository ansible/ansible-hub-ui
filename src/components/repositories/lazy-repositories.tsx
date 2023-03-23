import { t } from '@lingui/macro';
import { Button, Spinner, Tooltip } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnsibleRepositoryAPI } from 'src/api';
import { Paths, formatPath } from 'src/paths';
import { errorMessage } from 'src/utilities';

export const LazyRepositories = ({
  emptyText,
  onLoad,
  remoteHref,
}: {
  emptyText?: string;
  onLoad?: (repositories) => void;
  remoteHref: string;
}) => {
  const [repositories, setRepositories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!remoteHref) {
      setRepositories([]);
      setError(null);
      setLoading(false);
      onLoad?.([]);
      return;
    }

    setRepositories([]);
    setError(null);
    setLoading(true);

    AnsibleRepositoryAPI.list({ remote: remoteHref })
      .then(({ data }) => {
        setRepositories(data.results);
        setError(null);
        setLoading(false);
        onLoad?.(data.results);
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        setRepositories([]);
        setError(errorMessage(status, statusText));
        setLoading(false);
        onLoad?.([]);
      });
  }, [remoteHref]);

  const errorElement = error && (
    <Tooltip content={t`Failed to load repositories: ${error}`} key='empty'>
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
      {repositories?.map?.(({ name }, index) => (
        <>
          {index ? ', ' : ''}
          <Link to={formatPath(Paths.ansibleRepositoryDetail, { name })}>
            {name}
          </Link>
        </>
      ))}
      {!repositories?.length ? emptyText ?? '---' : null}
    </>
  );
};
