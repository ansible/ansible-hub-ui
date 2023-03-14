import { Trans, t } from '@lingui/macro';
import { Tooltip } from '@patternfly/react-core';
import * as React from 'react';
import { ContainerRepositoryType } from 'src/api';
import { BaseHeader, Breadcrumbs, SignatureBadge, Tabs } from 'src/components';
import { Paths, formatEEPath, formatPath } from 'src/paths';
import { lastSyncStatus, lastSynced } from 'src/utilities';

interface IProps {
  tab: string;
  updateState: (any) => void;
  container: ContainerRepositoryType;
  pageControls?: React.ReactElement;
  groupId?: number;
  displaySignatures: boolean;
}

export const ExecutionEnvironmentHeader = (props: IProps) => {
  const {
    container,
    groupId,
    tab,
    displaySignatures,
    pageControls,
    updateState,
  } = props;

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
              url: formatPath(Paths.executionEnvironments),
              name: t`Execution Environments`,
            },
            {
              name: container.name,
              url:
                tab === 'owners'
                  ? formatEEPath(Paths.executionEnvironmentDetail, {
                      container: container.name,
                    })
                  : null,
            },
            tab === 'owners'
              ? {
                  name: t`Owners`,
                  url: groupId
                    ? formatEEPath(Paths.executionEnvironmentDetailOwners, {
                        container: container.name,
                      })
                    : null,
                }
              : null,
            tab === 'owners' && groupId ? { name: t`Group ${groupId}` } : null,
          ].filter(Boolean)}
        />
      }
      pageControls={pageControls}
    >
      {displaySignatures && container.pulp.repository.sign_state && (
        <SignatureBadge
          isCompact
          signState={
            container.pulp.repository.sign_state == 'signed'
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
          <Tabs
            tabs={tabs}
            params={{ tab }}
            updateParams={({ tab }) => updateState({ redirect: tab })}
          />
        </div>
      </div>
    </BaseHeader>
  );
};
