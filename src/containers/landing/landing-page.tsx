import { t } from '@lingui/macro';
import * as React from 'react';
import { SigningServiceAPI, SigningServiceType } from 'src/api';
import {
  AlertList,
  AlertType,
  BaseHeader,
  LoadingPageSpinner,
  Main,
  closeAlertMixin,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { RouteProps, withRouter } from 'src/utilities';
import { ParamHelper, errorMessage } from 'src/utilities';

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

  componentDidMount() {
    if (!this.context.user || this.context.user.is_anonymous) {
      this.setState({ loading: false, unauthorised: true });
    } else {
      this.query();
    }
  }

  render() {
    const { loading, alerts } = this.state;

    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>
        <BaseHeader title={t`Landing Page`} />
        <Main>
          {loading ? (
            <LoadingPageSpinner />
          ) : (
            <section className='body'>
              <div className='hub-list-toolbar'></div>
            </section>
          )}
        </Main>
      </React.Fragment>
    );
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }

  private query() {
    this.setState({ loading: true }, () => {
      SigningServiceAPI.list(this.state.params)
        .then((result) => {
          this.setState({
            items: result.data.results,
            itemCount: result.data.count,
            loading: false,
          });
        })
        .catch((e) => {
          const { status, statusText } = e.response;
          this.setState({
            loading: false,
            items: [],
            itemCount: 0,
          });
          this.addAlert({
            title: t`Signature keys could not be displayed.`,
            variant: 'danger',
            description: errorMessage(status, statusText),
          });
        });
    });
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
