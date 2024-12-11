import { t } from '@lingui/core/macro';
import React, { Component } from 'react';
import {
  AlertList,
  type AlertType,
  BaseHeader,
  Main,
  RoleImportForm,
  closeAlert,
} from 'src/components';
import { type RouteProps, withRouter } from 'src/utilities';

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

  render() {
    const { alerts } = this.state;
    const addAlert = (alert) => this.addAlert(alert);

    return (
      <>
        <AlertList
          alerts={alerts}
          closeAlert={(i) =>
            closeAlert(i, {
              alerts,
              setAlerts: (alerts) => this.setState({ alerts }),
            })
          }
        />
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
