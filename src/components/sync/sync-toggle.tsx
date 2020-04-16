import * as React from 'react';

import { Switch } from '@patternfly/react-core';

interface IProps {
  collection: string;
  namespace: string;
}

interface IState {
  syncOn: boolean;
}

export class Sync extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      syncOn: true,
    };

    this.whitelisted();
  }

  render() {
    const { syncOn } = this.state;

    return (
      <Switch
        id='sync-status'
        className='sync-toggle'
        label='Sync'
        isChecked={syncOn}
        onChange={this.syncToggle}
      />
    );
  }

  private whitelisted = () => {
    // GET /synclists/(id)
    console.log('GET /synclists/{id}/');
    // FIXME: result of API request
    const whitelistedCollection = this.state.syncOn;

    if (!whitelistedCollection) {
      this.setState({ syncOn: whitelistedCollection });
    }

    return whitelistedCollection;
  };

  private whitelist = () => {
    console.log('PUT /synclists/{id}/, body');
    const api_success = true;

    if (api_success) {
      this.setState({ syncOn: true });
    }
  };

  private blacklist = () => {
    const api_success = true;

    if (api_success) {
      this.setState({ syncOn: false });
    }
  };

  private syncToggle = isChecked => {
    if (this.whitelisted()) {
      this.blacklist();
    } else {
      this.whitelist();
    }
  };
}
