import * as React from 'react';

import {
  Button,
  DropdownItem,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';
import { WarningTriangleIcon, WrenchIcon } from '@patternfly/react-icons';
import { SortTable, StatefulDropdown } from '..';
import * as moment from 'moment';

interface IProps {
  repositories: {}[];
  updateParams: (p) => void;
}

export class RemoteRepositoryTable extends React.Component<IProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { repositories } = this.props;
    if (repositories.length == 0) {
      return (
        <EmptyState className='empty' variant={EmptyStateVariant.full}>
          <EmptyStateIcon icon={WrenchIcon} />
          <Title headingLevel='h2' size='lg'>
            No remote repos
          </Title>
          <EmptyStateBody>Configure a remote repo</EmptyStateBody>
          <Button onClick={() => console.log('BUTTON CLICKED')}>
            <span>Add repo</span>
          </Button>
        </EmptyState>
      );
    }
    // TODO only with search
    if (repositories.length === 0 && false) {
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
    return this.renderTable(repositories);
  }

  private renderTable(repositories) {
    const params = { sort: 'repository' };
    let sortTableOptions = {
      headers: [
        {
          title: 'Repo name',
          type: 'alpha',
          id: 'repository',
        },
        {
          title: 'Content count',
          type: 'number',
          id: 'content',
        },
        {
          title: 'Last updated',
          type: 'number',
          id: 'updated_at',
        },
        {
          title: 'Token status',
          type: 'number',
          id: 'token',
        },
        {
          title: 'Last synced',
          type: 'alpha',
          id: 'last_sync_task.finished_at',
        },
        {
          title: 'Sync status',
          type: 'alpha',
          id: 'last_sync_task.error',
        },
        {
          title: '',
          type: 'none',
          id: 'buttons',
        },
        {
          title: '',
          type: 'none',
          id: 'kebab',
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
          updateParams={p => console.log(p)}
        />
        <tbody>
          {repositories.map(repository => this.renderRow(repository))}
        </tbody>
      </table>
    );
  }

  private renderRow(repository) {
    return (
      <tr>
        <td>{repository.name}</td>
        <td>{repository.count}</td>
        <td>
          {!!repository.updated_at
            ? moment(repository.updated_at).fromNow()
            : '---'}
        </td>
        <td>Active/Expired</td>
        <td>
          {!!repository.last_sync_task
            ? moment(repository.last_sync_task).fromNow()
            : '---'}
        </td>
        <td>TODO icon Idle/In progress/Failed</td>
        <td>
          <Button variant='secondary'>Configure</Button>
        </td>
        <td>
          <span>
            <StatefulDropdown
              items={[
                <DropdownItem
                  onClick={() => console.log('TODO Edit action -> fires modal')}
                >
                  Edit
                </DropdownItem>,
              ]}
            />
          </span>
        </td>
      </tr>
    );
  }
}
