import { t } from '@lingui/macro';
import * as React from 'react';
import cx from 'classnames';
import './my-imports.scss';

import { Tooltip, Spinner } from '@patternfly/react-core';
import { Link } from 'react-router-dom';

import { formatPath, Paths } from 'src/paths';
import {
  ImportListType,
  ImportDetailType,
  PulpStatus,
  CollectionVersion,
} from 'src/api';

import { StatusIndicator } from 'src/components';

import { Constants } from 'src/constants';

interface IProps {
  task: ImportDetailType;
  followMessages: boolean;
  selectedImport: ImportListType;
  loading: boolean;
  apiError?: string;

  setFollowMessages: (follow: boolean) => void;
  hideCollectionName?: boolean;
  collectionVersion?: CollectionVersion;
}

export class ImportConsole extends React.Component<IProps> {
  lastImport: React.RefObject<HTMLDivElement>;
  isLoading = false;

  constructor(props) {
    super(props);

    this.lastImport = React.createRef();
  }

  componentDidUpdate() {
    this.followLogs();
  }

  componentDidMount() {
    this.followLogs();
  }

  render() {
    const { selectedImport, task, apiError, loading } = this.props;

    if (loading || apiError) {
      return (
        <div className='hub-import-console'>
          {selectedImport ? this.renderTitle(selectedImport) : null}
          <div className='loading message-list'>
            {apiError ? <div className='message'>{apiError}</div> : <Spinner />}
          </div>
        </div>
      );
    }

    this.isLoading =
      selectedImport.state === PulpStatus.running ||
      selectedImport.state === PulpStatus.waiting;

    return (
      <div className='hub-import-console pf-c-content'>
        {this.renderTitle(selectedImport)}
        <div className='message-list'>
          <div
            className={cx({
              'follow-active': this.props.followMessages,
              'log-follow-button': true,
            })}
          >
            <Tooltip
              position='left'
              content={this.isLoading ? t`Follow logs` : t`Scroll to end`}
            >
              <span
                onClick={() => this.handleScrollClick()}
                className='fa fa-arrow-circle-down clickable'
              />
            </Tooltip>
          </div>

          {task.messages.map((x, i) => {
            return this.renderMessage(x, i);
          })}

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
        <div className='last-message' key={'last'} ref={this.lastImport} />
      </div>
    );
  }

  private renderMessage(item, i) {
    return (
      <div className='message' key={i}>
        <span className={item.level.toLowerCase()}>{item.message}&nbsp;</span>
      </div>
    );
  }

  private renderTitle(selectedImport) {
    const { task, hideCollectionName, collectionVersion } = this.props;

    let collectionHead = (
      <>
        {selectedImport.namespace}.{selectedImport.name}
      </>
    );
    let approvalStatus = t`waiting for import to finish`;

    if (collectionVersion) {
      const rlist = collectionVersion.repository_list;
      if (rlist.includes(Constants.NOTCERTIFIED)) {
        approvalStatus = t`rejected`;
      } else if (rlist.includes(Constants.NEEDSREVIEW)) {
        approvalStatus = t`waiting for approval`;
      } else if (rlist.includes(Constants.PUBLISHED)) {
        approvalStatus = t`approved`;
      } else {
        approvalStatus = t`could not be determined yet`;
      }

      collectionHead = (
        <Link
          className='title'
          to={formatPath(
            Paths.collectionByRepo,
            {
              namespace: selectedImport.namespace,
              collection: selectedImport.name,
              repo: rlist[0],
            },
            {
              version: selectedImport.version,
            },
          )}
        >
          {selectedImport.namespace}.{selectedImport.name}
        </Link>
      );
    }

    return (
      <div>
        {!hideCollectionName && (
          <div className='title-container'>{collectionHead}</div>
        )}

        <div className='title-bar'>
          <div>
            <span className='data-title'>{t`Status:`}</span>{' '}
            <StatusIndicator type='secondary' status={selectedImport.state} />
          </div>
          <div>
            <span className='data-title'>{t`Approval status:`}</span>{' '}
            {approvalStatus}
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
  }

  private handleScrollClick() {
    if (this.isLoading) {
      this.props.setFollowMessages(!this.props.followMessages);
    } else {
      this.lastImport.current.scrollIntoView({ behavior: 'smooth' });
    }
  }

  private followLogs() {
    if (this.props.followMessages && this.lastImport.current) {
      window.requestAnimationFrame(() => {
        this.lastImport.current.scrollIntoView({ behavior: 'smooth' });

        if (!this.isLoading) {
          this.props.setFollowMessages(false);
        }
      });
    }
  }
}
