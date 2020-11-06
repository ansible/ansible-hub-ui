import * as React from 'react';

import { Link } from 'react-router-dom';

import {
  DropdownItem,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
  ClipboardCopy,
} from '@patternfly/react-core';
import { WarningTriangleIcon } from '@patternfly/react-icons';
import { SortTable, StatefulDropdown } from '..';
import * as moment from 'moment';
import { Constants } from '../../constants';
import { getRepoUrl } from '../../utilities';
import { Paths, formatPath } from '../../paths';

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
          title: 'Distribution name',
          type: 'none',
          id: 'distribution',
        },
        {
          title: 'Repository name',
          type: 'none',
          id: 'repository',
        },
        {
          title: 'Content count',
          type: 'none',
          id: 'content',
        },
        {
          title: 'Last updated',
          type: 'none',
          id: 'updated_at',
        },
        {
          title: 'Ansible CLI URL',
          type: 'none',
          id: 'ansible_cli_url',
        },
        {
          title: 'CLI configuration',
          type: 'none',
          id: 'cli_config',
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
        return object.id !== 'updated_at' && object.id !== 'cli_config';
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
          {repositories.map(distribution => this.renderRow(distribution))}
        </tbody>
      </table>
    );
  }

  private renderRow(distribution) {
    return (
      <tr key={distribution.name}>
        <td>{distribution.name}</td>
        <td>{distribution.repository.name}</td>
        <td>{distribution.repository.content_count}</td>
        {DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE ? null : (
          <td>
            {!!distribution.repository.pulp_last_updated
              ? moment(distribution.repository.pulp_last_updated).fromNow()
              : '---'}
          </td>
        )}
        <td>
          <ClipboardCopy isReadOnly>
            {getRepoUrl(distribution.base_path)}
          </ClipboardCopy>
        </td>
        {DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE ? null : (
          <td>
            <ClipboardCopy isCode isReadOnly variant={'expansion'}>
              [galaxy]&#13;&#10; server_list = {distribution.repository.name}
              &#13;&#10; [galaxy_server_{distribution.repository.name}
              ]&#13;&#10; url={getRepoUrl(distribution.base_path)}
              content/published&#13;&#10; token=&lt;put your token here&gt;
            </ClipboardCopy>
          </td>
        )}
        <td>
          <span>
            <StatefulDropdown
              items={[
                <DropdownItem
                  key='2'
                  component={
                    <Link to={formatPath(Paths.token, {})}>Get token</Link>
                  }
                />,
              ]}
            />
          </span>
        </td>
      </tr>
    );
  }
}
