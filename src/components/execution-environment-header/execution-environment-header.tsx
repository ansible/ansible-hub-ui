import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import { Tooltip } from '@patternfly/react-core';
import { Paths, formatPath } from 'src/paths';
import { BaseHeader, Breadcrumbs, Tabs } from 'src/components';
import { ContainerRepositoryType } from 'src/api';
import { lastSyncStatus, lastSynced } from 'src/utilities';

interface IProps {
  id: string;
  tab: string;
  updateState: (any) => void;
  container: ContainerRepositoryType;
  pageControls?: React.ReactElement;
  groupId?: number;
}

export class ExecutionEnvironmentHeader extends React.Component<IProps> {
  render() {
    const { container, groupId, tab } = this.props;

    const tabs = [
      { id: 'detail', name: t`Detail` },
      { id: 'activity', name: t`Activity` },
      { id: 'images', name: t`Images` },
      { id: 'owners', name: t`Owners` },
    ];

    const last_sync_task = container.pulp.repository.remote?.last_sync_task;

    return (
      <BaseHeader
        title={container.name}
        breadcrumbs={
          <Breadcrumbs
            links={[
              {
                url: Paths.executionEnvironments,
                name: t`Execution Environments`,
              },
              {
                name: container.name,
                url:
                  tab === 'owners'
                    ? formatPath(Paths.executionEnvironmentDetail, {
                        container: container.name,
                      })
                    : null,
              },
              tab === 'owners'
                ? {
                    name: t`Owners`,
                    url: groupId
                      ? formatPath(Paths.executionEnvironmentDetailOwners, {
                          container: container.name,
                        })
                      : null,
                  }
                : null,
              tab === 'owners' && groupId
                ? { name: t`Group ${groupId}` }
                : null,
            ].filter(Boolean)}
          />
        }
        pageControls={this.props.pageControls}
      >
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
            <Tabs
              tabs={tabs}
              params={{ tab }}
              updateParams={(p) => {
                if (tab !== p.tab) {
                  this.props.updateState({ redirect: p.tab });
                }
              }}
            />
          </div>
        </div>
      </BaseHeader>
    );
  }
}
