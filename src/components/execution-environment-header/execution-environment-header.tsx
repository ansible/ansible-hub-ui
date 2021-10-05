import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import { Tooltip, Button } from '@patternfly/react-core';
import { Paths } from 'src/paths';
import { BaseHeader, Breadcrumbs, Tabs } from 'src/components';
import { ContainerRepositoryType } from 'src/api';
import { lastSyncStatus, lastSynced } from 'src/utilities';

interface IProps {
  id: string;
  tab: string;
  updateState: (any) => void;
  container: ContainerRepositoryType;
  pageControls?: React.ReactElement;
}

export class ExecutionEnvironmentHeader extends React.Component<IProps> {
  render() {
    const tabs = [
      { id: 'detail', name: t`Detail` },
      { id: 'activity', name: t`Activity` },
      { id: 'images', name: t`Images` },
    ];

    const last_sync_task =
      this.props.container.pulp.repository.remote?.last_sync_task;

    return (
      <BaseHeader
        title={this.props.container.name}
        breadcrumbs={
          <Breadcrumbs
            links={[
              {
                url: Paths.executionEnvironments,
                name: t`Execution environments`,
              },
              { name: this.props.container.name },
            ]}
          />
        }
        pageControls={this.props.pageControls}
      >
        <Tooltip content={this.props.container.description}>
          <p className={'truncated'}>{this.props.container.description}</p>
        </Tooltip>
        {last_sync_task && (
          <p className='truncated'>
            <Trans>
              Last updated from registry {lastSynced({ last_sync_task })}
            </Trans>{' '}
            {lastSyncStatus({ last_sync_task })}
          </p>
        )}
        <span />
        <div className='tab-link-container'>
          <div className='tabs'>
            <Tabs
              tabs={tabs}
              params={{ tab: this.props.tab }}
              updateParams={(p) => this.props.updateState({ redirect: p.tab })}
            />
          </div>
        </div>
      </BaseHeader>
    );
  }
}
