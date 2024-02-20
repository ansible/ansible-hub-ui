import { Trans, t } from '@lingui/macro';
import { Tooltip } from '@patternfly/react-core';
import React, { Component, ReactElement } from 'react';
import { ContainerRepositoryType } from 'src/api';
import {
  BaseHeader,
  Breadcrumbs,
  LinkTabs,
  SignatureBadge,
} from 'src/components';
import { Paths, formatEEPath, formatPath } from 'src/paths';
import { lastSyncStatus, lastSynced } from 'src/utilities';

interface IProps {
  container: ContainerRepositoryType;
  displaySignatures: boolean;
  groupId?: number;
  id: string;
  pageControls?: ReactElement;
  tab: string;
}

export class ExecutionEnvironmentHeader extends Component<IProps> {
  render() {
    const { container, groupId, tab, displaySignatures } = this.props;

    const linkParams = { container: container.name };

    const tabs = [
      {
        active: tab === 'detail',
        title: t`Detail`,
        link: formatEEPath(Paths.executionEnvironmentDetail, linkParams),
      },
      {
        active: tab === 'activity',
        title: t`Activity`,
        link: formatEEPath(
          Paths.executionEnvironmentDetailActivities,
          linkParams,
        ),
      },
      {
        active: tab === 'images',
        title: t`Images`,
        link: formatEEPath(Paths.executionEnvironmentDetailImages, linkParams),
      },
      {
        active: tab === 'access',
        title: t`Access`,
        link: formatEEPath(Paths.executionEnvironmentDetailAccess, linkParams),
      },
    ];

    const last_sync_task = container.pulp.repository.remote?.last_sync_task;

    return (
      <BaseHeader
        title={container.name}
        breadcrumbs={
          <Breadcrumbs
            links={[
              {
                url: formatPath(Paths.executionEnvironments),
                name: t`Execution Environments`,
              },
              {
                name: container.name,
                url:
                  tab === 'access'
                    ? formatEEPath(Paths.executionEnvironmentDetail, linkParams)
                    : null,
              },
              tab === 'access'
                ? {
                    name: t`Access`,
                    url: groupId
                      ? formatEEPath(
                          Paths.executionEnvironmentDetailAccess,
                          linkParams,
                        )
                      : null,
                  }
                : null,
              tab === 'access' && groupId
                ? { name: t`Group ${groupId}` }
                : null,
            ].filter(Boolean)}
          />
        }
        pageControls={this.props.pageControls}
      >
        {displaySignatures &&
          this.props.container.pulp.repository.sign_state && (
            <SignatureBadge
              isCompact
              signState={
                this.props.container.pulp.repository.sign_state == 'signed'
                  ? 'signed'
                  : 'unsigned'
              }
            />
          )}
        {last_sync_task && (
          <p className='hub-m-truncated'>
            <Trans>
              Last updated from registry {lastSynced({ last_sync_task })}
            </Trans>{' '}
            {lastSyncStatus({ last_sync_task })}
          </p>
        )}
        <div style={{ height: '10px' }}>&nbsp;</div>
        <Tooltip content={container.description}>
          <p data-cy='description' className={'hub-m-truncated'}>
            {container.description}
          </p>
        </Tooltip>

        <span />
        <div className='hub-tab-link-container'>
          <div className='tabs'>
            <LinkTabs tabs={tabs} />
          </div>
        </div>
      </BaseHeader>
    );
  }
}
