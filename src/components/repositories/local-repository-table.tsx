import * as React from 'react';

import {
  Button,
  DropdownItem,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
  ClipboardCopy,
} from '@patternfly/react-core';
import { WarningTriangleIcon, WrenchIcon } from '@patternfly/react-icons';
import { SortTable, StatefulDropdown } from '..';
import * as moment from 'moment';
import { Constants } from '../../constants';

interface IProps {
  repositories: {}[];
  updateParams: (p) => void;
}

export class LocalRepositoryTable extends React.Component<IProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { repositories } = this.props;
    if (repositories.length === 0) {
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
          title: 'URL',
          type: 'alpha',
          id: 'url',
        },
        {
          title: '',
          type: 'none',
          id: 'kebab',
        },
      ],
    };

    if (DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE) {
      sortTableOptions.headers = sortTableOptions.headers.filter(object => {
        return object.id !== 'updated_at';
      });
    }

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
      <tr key={repository.name}>
        <td>{repository.name}</td>
        <td>{repository.count}</td>
        {DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE ? null : (
          <td>
            {!!repository.updated_at
              ? moment(repository.updated_at).fromNow()
              : '---'}
          </td>
        )}
        <td>
          <ClipboardCopy isReadOnly>{repository.url}</ClipboardCopy>
        </td>
        <td>
          <span>
            <StatefulDropdown
              items={[
                <DropdownItem
                  key='token'
                  onClick={() => console.log('TODO Get token')}
                >
                  Get token
                </DropdownItem>,
              ]}
            />
          </span>
        </td>
      </tr>
    );
  }
}
