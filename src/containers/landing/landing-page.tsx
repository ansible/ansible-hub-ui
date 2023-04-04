import { t } from '@lingui/macro';
import * as React from 'react';
import { SigningServiceType } from 'src/api';
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
import { ParamHelper } from 'src/utilities';

interface IState {
  params: {
    page?: number;
    page_size?: number;
  };
  loading: boolean;
  items: SigningServiceType[];
  itemCount: number;
  alerts: AlertType[];
  unauthorised: boolean;
  inputText: string;
}

export class LandingPage extends React.Component<RouteProps, IState> {
  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    if (!params['page_size']) {
      params['page_size'] = 100;
    }

    this.state = {
      params: params,
      items: [],
      loading: true,
      itemCount: 0,
      alerts: [],
      unauthorised: false,
      inputText: '',
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

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
  }
}

export default withRouter(LandingPage);

LandingPage.contextType = AppContext;
