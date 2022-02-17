import React from 'react';
import { t, Trans } from '@lingui/macro';
import { AppContext } from 'src/loaders/app-context';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { AlertType, BaseHeader, closeAlertMixin, Main } from 'src/components';
import { Toolbar, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import axios from 'axios';

interface IState {
  roles: [];
  alerts: AlertType[];
}
export class RoleList extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      roles: [],
      alerts: [],
    }
  }

  componentDidMount() {
      axios.get("http://localhost:5001/pulp/api/v3/roles/")
      .then((res) => {
        console.log("DATA: ", res.data);
      }).catch((err) => {
        console.log('BIG ERROR', err?.message);
        this.addAlert(err?.message, 'danger')
      })
  }

  render() {
    return (
      <>
        <BaseHeader title={t`Roles`}></BaseHeader>
        <Main>
          <section>
            <div>
              <Toolbar>
                <ToolbarGroup>
                  <ToolbarItem></ToolbarItem>
                  <ToolbarItem></ToolbarItem>
                </ToolbarGroup>
              </Toolbar>
            </div>
          </section>
        </Main>
      </>
    );
  }

  private queryRoles = () => {
    return fetch("http://localhost:5001/pulp/api/v3/roles/")
    .then((res) => res.json())
    .then((data) => console.log("Data: ", data))
  }

  private addAlert(title, variant, description?) {
    this.setState({
      alerts: [
        ...this.state.alerts,
        {
          description,
          title,
          variant,
        },
      ],
    });
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

export default withRouter(RoleList);
RoleList.contextType = AppContext;
