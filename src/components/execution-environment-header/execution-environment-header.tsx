import * as React from 'react';
import { Tooltip, Button } from '@patternfly/react-core';
import { Paths } from 'src/paths';
import { BaseHeader, Breadcrumbs, Tabs } from 'src/components';
import { ContainerRepositoryType } from 'src/api';

interface IProps {
  id: string;
  tab: string;
  updateState: (any) => void;
  container: ContainerRepositoryType;
}

export class ExecutionEnvironmentHeader extends React.Component<IProps> {

  render() {
    const tabs = ['Detail', 'Activity', 'Images'];
    return (
      <BaseHeader
        title={this.props.container.name}
        breadcrumbs={
          <Breadcrumbs
            links={[
              {
                url: Paths.executionEnvironments,
                name: 'Container Registry',
              },
              { name: this.props.container.name },
            ]}
          />
        }
        pageControls={
          <Button
            variant='primary'
            onClick={() => this.props.updateState({ editing: true })}
          >
            {' '}
            Edit{' '}
          </Button>
        }
      >
        <Tooltip content={this.props.container.description}>
          <p className={'truncated'}>{this.props.container.description}</p>
        </Tooltip>
        <span />
        <div className='tab-link-container'>
          <div className='tabs'>
            <Tabs
              tabs={tabs}
              params={{ tab: this.props.tab }}
              updateParams={p => this.props.updateState({ redirect: p.tab })}
            />
          </div>
        </div>
      </BaseHeader>
    );
  }
}
