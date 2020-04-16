import * as React from 'react';

import { Switch } from '@patternfly/react-core';

import { SyncListAPI } from '../../api';

interface IProps {
  collection: string;
  namespace: string;
}

interface IState {
  policy: string;
  id: number;
  name: string;
  repository: string;
  users: string[];
  groups: string[];
}

export class Sync extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      policy: '',
      id: null,
      name: '',
      repository: '',
      users: [],
      groups: [],
    };
  }

  componentDidMount() {
    SyncListAPI.list().then(result => {
      const syncLists = result.data.data;
      const associateable = collection =>
        collection.name == this.props.collection &&
        collection.namespace == this.props.namespace;
      const collectionSyncList = syncLists
        .filter(syncList => syncList.collections.some(associateable))
        .pop();
      this.setState({
        id: collectionSyncList.id,
        name: collectionSyncList.name,
        policy: collectionSyncList.policy,
        repository: collectionSyncList.repository,
        users: collectionSyncList.users,
        groups: collectionSyncList.groups,
      });
    });
    this.whitelisted();
  }

  render() {
    return (
      <Switch
        id='sync-status'
        className='sync-toggle'
        label='Sync'
        isChecked={this.state.policy === 'whitelist'}
        onChange={this.syncToggle}
        isDisabled={this.state.policy === ''}
      />
    );
  }

  private whitelisted = () => {
    SyncListAPI.get(this.state.id).then(result => {
      const whitelistedCollection = result.data.policy === 'whitelist';

      if (!whitelistedCollection) {
        this.setState({ policy: 'whitelist' });
      }
    });
  };

  private toggleBody = policy => {
    const body = {
      name: this.state.name,
      policy: policy,
      repository: this.state.repository,
      collections: [
        {
          namespace: this.props.namespace,
          name: this.props.collection,
        },
      ],
      namespaces: [this.props.namespace],
      users: this.state.users,
      groups: this.state.groups,
    };
    return body;
  };

  private whitelist = () => {
    SyncListAPI.update(this.state.id, this.toggleBody('whitelist')).then(
      result => {
        if (result.status === 200) {
          this.setState({ policy: result.data.policy });
        }
      },
    );
  };

  private blacklist = () => {
    SyncListAPI.update(this.state.id, this.toggleBody('blacklist')).then(
      result => {
        if (result.status === 200) {
          this.setState({ policy: result.data.policy });
        }
      },
    );
  };

  private syncToggle = isChecked => {
    if (this.state.policy === 'whitelist') {
      this.blacklist();
    } else {
      this.whitelist();
    }
  };
}
