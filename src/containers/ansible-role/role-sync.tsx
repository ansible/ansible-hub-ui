import { t } from '@lingui/macro';
import React from 'react';
import {
  AlertList,
  AlertType,
  BaseHeader,
  Main,
  RoleSyncForm,
  closeAlertMixin,
} from 'src/components';
import { RouteProps, withRouter } from 'src/utilities';

interface RoleState {
  alerts: AlertType[];
}

class AnsibleRoleSync extends React.Component<RouteProps, RoleState> {
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

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }

  render() {
    const { alerts } = this.state;
    const addAlert = (alert) => this.addAlert(alert);
    const closeAlert = (i) => this.closeAlert(i);

    return (
      <>
        <AlertList alerts={alerts} closeAlert={closeAlert} />
        <BaseHeader title={t`Sync role`} />
        <Main>
          <section className='body'>
            <RoleSyncForm addAlert={addAlert} />
          </section>
        </Main>
      </>
    );
  }
}

export default withRouter(AnsibleRoleSync);
