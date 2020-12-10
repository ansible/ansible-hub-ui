import * as React from 'react';
import * as moment from 'moment';

import {
  Button,
  DropdownItem,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
  Tooltip,
  Popover,
} from '@patternfly/react-core';
import {
  WarningTriangleIcon,
  WrenchIcon,
  ExclamationCircleIcon,
} from '@patternfly/react-icons';

import { RemoteType, UserType, PulpStatus } from '../../api';
import { HelperText, SortTable, StatefulDropdown } from '..';
import { StatusIndicator } from '../../components';

import { Constants } from '../../constants';

interface IProps {
  remotes: RemoteType[];
  updateParams: (p) => void;
  editRemote: (r: RemoteType) => void;
  syncRemote: (distribution: string) => void;
  user: UserType;
  refreshRemotes: () => void;
}

export class RemoteRepositoryTable extends React.Component<IProps> {
  polling: any;
  refreshOnStatuses = [PulpStatus.waiting, PulpStatus.running];

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.polling = setInterval(() => {
      const { remotes } = this.props;
      let refresh = false;
      for (const remote of remotes) {
        for (const repo of remote.repositories) {
          if (repo.last_sync_task) {
            if (this.refreshOnStatuses.includes(repo.last_sync_task.state)) {
              refresh = true;
              break;
            }
          }
        }
      }

      if (refresh) {
        this.props.refreshRemotes();
      } else {
      }
    }, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.polling);
  }

  render() {
    const { remotes } = this.props;
    if (remotes.length == 0) {
      return (
        <EmptyState className='empty' variant={EmptyStateVariant.full}>
          <EmptyStateIcon icon={WrenchIcon} />
          <Title headingLevel='h2' size='lg'>
            No remote repos
          </Title>
        </EmptyState>
      );
    }
    // TODO only with search
    if (remotes.length === 0) {
      return (
        <EmptyState className='empty' variant={EmptyStateVariant.full}>
          <EmptyStateIcon icon={WarningTriangleIcon} />
          <Title headingLevel='h2' size='lg'>
            No matches
          </Title>
          <EmptyStateBody>
            Please try adjusting your search query.
          </EmptyStateBody>
        </EmptyState>
      );
    }
    return this.renderTable(remotes);
  }

  private renderTable(remotes) {
    const params = { sort: 'repository' };
    let sortTableOptions = {
      headers: [
        {
          title: 'Remote name',
          type: 'none',
          id: 'remote',
        },
        {
          title: 'Repositories',
          type: 'none',
          id: 'repository',
        },
        {
          title: 'Last updated',
          type: 'none',
          id: 'updated_at',
        },
        {
          title: 'Last synced',
          type: 'none',
          id: 'last_sync_task.finished_at',
        },
        {
          title: 'Sync status',
          type: 'none',
          id: 'last_sync_task.error',
        },
        {
          title: '',
          type: 'none',
          id: 'controls',
        },
      ],
    };

    return (
      <table
        aria-label='Collection versions'
        className='content-table pf-c-table'
      >
        <SortTable
          options={sortTableOptions}
          params={params}
          updateParams={p => null}
        />
        <tbody>{remotes.map((remote, i) => this.renderRow(remote, i))}</tbody>
      </table>
    );
  }

  private renderRow(remote, i) {
    const { user } = this.props;
    return (
      <tr key={i}>
        <td>{remote.name}</td>
        <td>{remote.repositories.map(r => r.name).join(', ')}</td>
        <td>
          {!!remote.updated_at ? moment(remote.updated_at).fromNow() : '---'}
        </td>
        <td>
          {!!remote.last_sync_task && !!remote.last_sync_task.finished_at
            ? moment(remote.last_sync_task.finished_at).fromNow()
            : '---'}
        </td>
        <td>{this.renderStatus(remote)}</td>
        <td>
          {remote.repositories.length === 0 ? (
            <Tooltip content='There are no repos associated with this remote.'>
              <Button variant='plain'>
                <ExclamationCircleIcon />
              </Button>
            </Tooltip>
          ) : (
            !!user &&
            user.model_permissions.change_remote && (
              <>
                {this.getConfigureOrSyncButton(remote)}
                <span>
                  <StatefulDropdown
                    items={[
                      <DropdownItem
                        key='edit'
                        onClick={() => this.props.editRemote(remote)}
                      >
                        Edit
                      </DropdownItem>,
                    ]}
                  />
                </span>
              </>
            )
          )}
        </td>
      </tr>
    );
  }

  private renderStatus(remote) {
    if (!remote.last_sync_task) {
      return '---';
    }

    let errorMessage = null;
    if (remote['last_sync_task']['error']) {
      errorMessage = (
        <HelperText content={remote.last_sync_task.error['description']} />
      );
    }

    return (
      <>
        <StatusIndicator status={remote.last_sync_task.state} /> {errorMessage}
      </>
    );
  }

  private getConfigureOrSyncButton(remote: RemoteType) {
    const { user } = this.props;
    if (!!user && !user.model_permissions.change_remote) {
      return null;
    }
    const configButton = (
      <Button onClick={() => this.props.editRemote(remote)} variant='secondary'>
        Configure
      </Button>
    );

    const syncButton = (
      <>
        <Button
          isDisabled={
            remote.repositories.length === 0 ||
            (remote.last_sync_task &&
              ['running', 'waiting'].includes(remote.last_sync_task.state))
          }
          onClick={() =>
            this.props.syncRemote(
              remote.repositories[0].distributions[0].base_path,
            )
          }
          variant='secondary'
        >
          Sync
        </Button>
      </>
    );

    let remoteType = 'none';

    for (const host of Constants.UPSTREAM_HOSTS) {
      if (remote.url.includes(host)) {
        remoteType = 'community';
        break;
      }
    }

    for (const host of Constants.DOWNSTREAM_HOSTS) {
      if (remote.url.includes(host)) {
        remoteType = 'certified';
        break;
      }
    }

    if (
      remoteType === 'community' &&
      remote.url &&
      remote.name &&
      remote.requirements_file
    ) {
      return syncButton;
    }

    if (
      remoteType === 'certified' &&
      remote.url &&
      remote.name &&
      remote.auth_url
    ) {
      return syncButton;
    }

    return configButton;
  }
}
