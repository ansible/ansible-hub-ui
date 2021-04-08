import * as React from 'react';
import { Tooltip } from '@patternfly/react-core';
import { Paths } from 'src/paths';
import { BaseHeader, Breadcrumbs, Tabs } from 'src/components';
import { ExecutionEnvironmentAPI } from 'src/api';

interface IProps {
  id: string;
  tab: string;
  updateState: (any) => void;
}

interface IState {
  container: { name: string; description: string; namespace: string };
}

export class ExecutionEnvironmentHeader extends React.Component<
  IProps,
  IState
> {
  componentDidMount() {
    ExecutionEnvironmentAPI.get(this.props.id)
      .then(result => {
        this.setState({
          container: {
            name: result.data.name,
            description: result.data.description,
            namespace: result.data.namespace,
          },
        });
      })
      .catch(error => this.props.updateState({ redirect: 'notFound' }));
  }
  constructor(props) {
    super(props);

    this.state = {
      container: { name: '', description: '', namespace: '' },
    };
  }

  render() {
    const tabs = ['Detail', 'Activity', 'Images'];
    return (
      <BaseHeader
        title={this.state.container.name}
        breadcrumbs={
          <Breadcrumbs
            links={[
              {
                url: Paths.executionEnvironments,
                name: 'Container Registry',
              },
              { name: this.state.container.name },
            ]}
          />
        }
      >
        <Tooltip content={this.state.container.description}>
          <p className={'truncated'}>{this.state.container.description}</p>
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
