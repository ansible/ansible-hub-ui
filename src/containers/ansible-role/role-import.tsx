import { t } from '@lingui/macro';
import React, { Component } from 'react';
import {
  AlertList,
  AlertType,
  BaseHeader,
  Main,
  RoleImportForm,
  closeAlert,
} from 'src/components';
import { RouteProps, withRouter } from 'src/utilities';

interface RoleState {
  alerts: AlertType[];
}

class AnsibleRoleImport extends Component<RouteProps, RoleState> {
  constructor(props) {
    super(props);
    this.state = {
      alerts: [],
    };
  }

  private addAlert(alert: AlertType) {
    this.setState({
      alerts: [...this.state.alerts, alert],
    });
  }

  private closeAlert(index) {
    closeAlert(index, {
      alerts: this.state.alerts,
      setAlerts: (alerts) => this.setState({ alerts }),
    });
  }

  render() {
    const { alerts } = this.state;
    const addAlert = (alert) => this.addAlert(alert);
    const closeAlert = (i) => this.closeAlert(i);

    return (
      <>
        <AlertList alerts={alerts} closeAlert={closeAlert} />
        <BaseHeader title={t`Import role`} />
        <Main>
          <section className='body'>
            <RoleImportForm addAlert={addAlert} />
          </section>
        </Main>
      </>
    );
  }
}

export default withRouter(AnsibleRoleImport);
