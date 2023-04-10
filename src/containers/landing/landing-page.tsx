import { t } from '@lingui/macro';
import * as React from 'react';
import {
  AlertList,
  AlertType,
  BaseHeader,
  LandingPageCard,
  Main,
  closeAlertMixin,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { RouteProps, withRouter } from 'src/utilities';

interface IState {
  alerts: AlertType[];
}

export class LandingPage extends React.Component<RouteProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      alerts: [],
    };
  }

  render() {
    const { alerts } = this.state;

    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>
        <BaseHeader title={t`Home`} />
        <Main>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignContent: 'flex-start',
              marginLeft: '-24px',
            }}
          >
            <LandingPageCard
              title={t`Lorem Ipsum`}
              body={t`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nibh odio, semper non ex vitae, semper convallis tellus. Praesent et ipsum erat. Praesent hendrerit urna eget mattis vestibulum. Maecenas dictum orci vitae nisl sagittis laoreet id et mauris. Sed pharetra accumsan nibh a viverra. Duis tincidunt eros at maximus sodales. Fusce gravida tellus ligula eu posuere lorem placerat ut.`}
            />
            <LandingPageCard
              title={t`Lorem Ipsum`}
              body={t`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nibh odio, semper non ex vitae, semper convallis tellus. Praesent et ipsum erat. Praesent hendrerit urna eget mattis vestibulum. Maecenas dictum orci vitae nisl sagittis laoreet id et mauris. Sed pharetra accumsan nibh a viverra. Duis tincidunt eros at maximus sodales. Fusce gravida tellus ligula eu posuere lorem placerat ut.`}
            />
            <LandingPageCard
              title={t`Lorem Ipsum`}
              body={t`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nibh odio, semper non ex vitae, semper convallis tellus. Praesent et ipsum erat. Praesent hendrerit urna eget mattis vestibulum. Maecenas dictum orci vitae nisl sagittis laoreet id et mauris. Sed pharetra accumsan nibh a viverra. Duis tincidunt eros at maximus sodales. Fusce gravida tellus ligula eu posuere lorem placerat ut.`}
            />
            <LandingPageCard
              title={t`Lorem Ipsum`}
              body={t`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nibh odio, semper non ex vitae, semper convallis tellus. Praesent et ipsum erat. Praesent hendrerit urna eget mattis vestibulum. Maecenas dictum orci vitae nisl sagittis laoreet id et mauris. Sed pharetra accumsan nibh a viverra. Duis tincidunt eros at maximus sodales. Fusce gravida tellus ligula eu posuere lorem placerat ut.`}
            />
          </div>
        </Main>
      </React.Fragment>
    );
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }

  private addAlert(alert: AlertType) {
    this.setState({
      alerts: [...this.state.alerts, alert],
    });
  }
}

export default withRouter(LandingPage);

LandingPage.contextType = AppContext;
