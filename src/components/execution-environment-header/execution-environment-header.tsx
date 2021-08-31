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
  pageControls?: React.ReactElement;
}

export class ExecutionEnvironmentHeader extends React.Component<IProps> {
  render() {
    const tabs = [t`Detail`, t`Activity`, t`Images`];
    return (
      <BaseHeader
        title={this.props.container.name}
        breadcrumbs={
          <Breadcrumbs
            links={[
              {
                url: Paths.executionEnvironments,
                name: t`Container Registry`,
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
