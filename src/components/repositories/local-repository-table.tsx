import { t } from '@lingui/macro';
import * as React from 'react';
import { CollectionCount } from 'src/components';
import { Constants } from 'src/constants';
import { getRepoUrl } from 'src/utilities';
import { ClipboardCopy, DateComponent, EmptyStateNoData, SortTable } from '..';

interface IProps {
  repositories: {
    base_path: string;
    name: string;
    repository: {
      content_count: number;
      name: string;
      pulp_last_updated: string;
    };
  }[];
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
        <EmptyStateNoData
          title={t`No local repositories yet`}
          description={''}
        />
      );
    }
    return this.renderTable(repositories);
  }

  private renderTable(repositories) {
    const params = { sort: 'repository' };
    const sortTableOptions = {
      headers: [
        {
          title: t`Distribution name`,
          type: 'none',
          id: 'distribution',
        },
        {
          title: t`Repository name`,
          type: 'none',
          id: 'repository',
        },
        {
          title: t`Collection count`,
          type: 'none',
          id: 'content',
        },
        {
          title: t`Last updated`,
          type: 'none',
          id: 'updated_at',
        },
        {
          title: t`Distribution URL`,
          type: 'none',
          id: 'ansible_cli_url',
        },
        {
          title: t`CLI configuration`,
          type: 'none',
          id: 'cli_config',
        },
      ],
    };

    if (DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE) {
      sortTableOptions.headers = sortTableOptions.headers.filter((object) => {
        return object.id !== 'updated_at' && object.id !== 'cli_config';
      });
    }

    return (
      <table
        aria-label={t`Collection versions`}
        className='hub-c-table-content pf-c-table'
      >
        <SortTable
          options={sortTableOptions}
          params={params}
          updateParams={(p) => console.log(p)}
        />
        <tbody>
          {repositories.map((distribution) => this.renderRow(distribution))}
        </tbody>
      </table>
    );
  }

  private renderRow(distribution) {
    const cliConfig = [
      '[galaxy]',
      `server_list = ${distribution.repository?.name}_repo`,
      '',
      `[galaxy_server.${distribution.repository?.name}_repo]`,
      `url=${getRepoUrl()}`,
      'token=<put your token here>',
    ];

    return (
      <tr key={distribution.name}>
        <td>{distribution.name}</td>
        <td>{distribution.repository?.name}</td>
        <td>
          <CollectionCount distributionPath={distribution.base_path} />
        </td>
        {DEPLOYMENT_MODE ===
        Constants.INSIGHTS_DEPLOYMENT_MODE ? null : distribution.repository
            ?.pulp_last_updated ? (
          <td>
            <DateComponent date={distribution.repository.pulp_last_updated} />
          </td>
        ) : (
          <td>{'---'}</td>
        )}
        <td>
          <ClipboardCopy isReadOnly>{getRepoUrl()}</ClipboardCopy>
        </td>
        {DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE ? null : (
          <td>
            {distribution.repository ? (
              <ClipboardCopy isCode isReadOnly variant={'expansion'}>
                {cliConfig.join('\n')}
              </ClipboardCopy>
            ) : (
              '---'
            )}
          </td>
        )}
      </tr>
    );
  }
}
