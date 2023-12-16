import { t } from '@lingui/macro';
import { Spinner } from '@patternfly/react-core';
import cx from 'classnames';
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  CollectionVersionSearch,
  ImportDetailType,
  ImportListType,
  PulpStatus,
} from 'src/api';
import { StatusIndicator, Tooltip } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import './my-imports.scss';

interface IProps {
  apiError?: string;
  collection?: CollectionVersionSearch;
  empty: boolean;
  followMessages: boolean;
  hideCollectionName?: boolean;
  loading: boolean;
  selectedImport: ImportListType;
  setFollowMessages: (follow: boolean) => void;
  task: ImportDetailType;
}

export function ImportConsole({
  apiError,
  collection,
  empty,
  followMessages,
  hideCollectionName,
  loading,
  selectedImport,
  setFollowMessages,
  task,
}: IProps) {
  const lastImport = useRef<HTMLDivElement>(null);

  const inProgress = !selectedImport
    ? true
    : selectedImport.state === PulpStatus.running ||
      selectedImport.state === PulpStatus.waiting;

  const scrollToBottom = () =>
    window.requestAnimationFrame(
      () => lastImport.current?.scrollIntoView({ behavior: 'smooth' }),
    );

  // causes scrollToBottom via useEffect on followLogs change
  const startToFollow = () => setFollowMessages(!followMessages);

  useEffect(() => {
    if (!followMessages) {
      return;
    }

    if (!inProgress) {
      setFollowMessages(false);
    }

    scrollToBottom();
  }, [followMessages, inProgress]);

  const collectionPipeline = collection?.repository?.pulp_labels?.pipeline;

  const title =
    !selectedImport || empty ? null : (
      <div>
        {!hideCollectionName && (
          <div className='title-container'>
            {!collection ? (
              `${selectedImport.namespace}.${selectedImport.name}`
            ) : (
              <Link
                className='title'
                to={formatPath(
                  Paths.collectionByRepo,
                  {
                    namespace: selectedImport.namespace,
                    collection: selectedImport.name,
                    repo: collection?.repository.name,
                  },
                  {
                    version: selectedImport.version,
                  },
                )}
              >
                {selectedImport.namespace}.{selectedImport.name}
              </Link>
            )}
          </div>
        )}

        <div className='title-bar'>
          <div>
            <span className='data-title'>{t`Status:`}</span>{' '}
            <StatusIndicator type='secondary' status={selectedImport.state} />
          </div>
          <div>
            <span className='data-title'>{t`Approval status:`}</span>{' '}
            {!collection
              ? t`waiting for import to finish`
              : {
                  rejected: t`rejected`,
                  staging: t`waiting for approval`,
                  approved: t`approved`,
                }[collectionPipeline] || t`could not be determined yet`}
          </div>
          <div>
            <span className='data-title'>{t`Version:`}</span>{' '}
            {selectedImport.version}
          </div>

          {task && task.error ? (
            <div>
              <span className='data-title'>{t`Error message:`}</span>{' '}
              {task.error.code}
              <pre>
                <code>{task.error.description}</code>
              </pre>
              <pre>
                <code>{task.error.traceback}</code>
              </pre>
            </div>
          ) : null}
        </div>
      </div>
    );

  if (loading || apiError) {
    return (
      <div className='hub-import-console'>
        {title}
        <div className='loading message-list'>
          {apiError ? <div className='message'>{apiError}</div> : <Spinner />}
        </div>
      </div>
    );
  }

  const renderMessage = ({ level, message }, i) => (
    <div className='message' key={i}>
      <span className={level.toLowerCase()}>{message}&nbsp;</span>
    </div>
  );

  return (
    <div className='hub-import-console pf-c-content' data-cy={'ImportConsole'}>
      {title}
      <div className='message-list'>
        <div
          className={cx({
            'follow-active': followMessages,
            'log-follow-button': true,
          })}
        >
          <Tooltip
            position='left'
            content={inProgress ? t`Follow logs` : t`Scroll to end`}
          >
            <span
              onClick={inProgress ? startToFollow : scrollToBottom}
              className='fa fa-arrow-circle-down clickable'
            />
          </Tooltip>
        </div>

        {task.messages.map(renderMessage)}

        {task.messages.length === 0 ? (
          <div className='message'>
            <span className='error'>{t`No task messages available`}</span>
          </div>
        ) : null}

        {task.state === PulpStatus.completed && (
          <div className='message'>
            <br />
            <span className='success'>{t`Done`}</span>
          </div>
        )}

        {task.state === PulpStatus.failed && (
          <div className='message'>
            <br />
            <span className='failed'>{t`Failed`}</span>
          </div>
        )}
      </div>

      <div className='last-message' ref={lastImport} />
    </div>
  );
}
