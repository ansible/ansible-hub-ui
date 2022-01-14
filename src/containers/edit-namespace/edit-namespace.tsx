import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';
import { Form, ActionGroup, Button, Spinner } from '@patternfly/react-core';

import {
  PartnerHeader,
  NamespaceForm,
  ResourcesForm,
  AlertList,
  closeAlertMixin,
  AlertType,
  Main,
  EmptyStateUnauthorized,
  LoadingPageSpinner,
} from 'src/components';
import {
  MyNamespaceAPI,
  NamespaceType,
  ActiveUserAPI,
  NamespaceLinkType,
} from 'src/api';

import { formatPath, namespaceBreadcrumb, Paths } from 'src/paths';
import {
  ErrorMessagesType,
  ParamHelper,
  mapErrorMessages,
} from 'src/utilities';
import { AppContext } from 'src/loaders/app-context';

interface IState {
  namespace: NamespaceType;
  newLinkName: string;
  newLinkURL: string;
  errorMessages: ErrorMessagesType;
  saving: boolean;
  loading: boolean;
  redirect: string;
  unsavedData: boolean;
  alerts: AlertType[];
  params: {
    tab?: string;
  };
  userId: string;
  unauthorized: boolean;
}

class EditNamespace extends React.Component<RouteComponentProps, IState> {
  queryParams: URLSearchParams;

  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search);

    if (!params['tab']) {
      params['tab'] = 'edit-details';
    }

    this.state = {
      loading: false,
      alerts: [],
      namespace: null,
      userId: '',
      newLinkURL: '',
      newLinkName: '',
      errorMessages: {},
      saving: false,
      redirect: null,
      unsavedData: false,
      params: params,
      unauthorized: false,
    };
  }

  componentDidMount() {
    this.setState({ loading: true }, () => {
      ActiveUserAPI.getUser()
        .then((result) => {
          this.setState({ userId: result.account_number }, () =>
            this.loadNamespace(),
          );
        })
        .catch((e) =>
          this.setState(
            {
              loading: false,
              redirect: formatPath(Paths.namespaceByRepo, {
                namespace: this.props.match.params['namespace'],
                repo: this.context.selectedRepo,
              }),
            },
            () => {
              this.context.setAlerts([
                ...this.context.alerts,
                {
                  variant: 'danger',
                  title: t`Error loading active user.`,
                  description: e?.message,
                },
              ]);
            },
          ),
        );
    });
  }

  render() {
    const {
      namespace,
      errorMessages,
      saving,
      redirect,
      params,
      userId,
      unauthorized,
      loading,
    } = this.state;

    const tabs = [
      { id: 'edit-details', name: t`Edit details` },
      { id: 'edit-resources', name: t`Edit resources` },
    ];

    if (redirect) {
      return <Redirect push to={redirect} />;
    }

    if (loading) {
      return <LoadingPageSpinner />;
    }

    if (!namespace) {
      return null;
    }

    return (
      <React.Fragment>
        <PartnerHeader
          namespace={namespace}
          breadcrumbs={[
            namespaceBreadcrumb,
            {
              name: namespace.name,
              url: formatPath(Paths.myCollections, {
                namespace: namespace.name,
              }),
            },
            { name: t`Edit` },
          ]}
          tabs={tabs}
          params={params}
          updateParams={(p) => this.updateParams(p)}
        ></PartnerHeader>
        <AlertList
          alerts={this.state.alerts}
          closeAlert={(i) => this.closeAlert(i)}
        />
        {unauthorized ? (
          <EmptyStateUnauthorized />
        ) : (
          <Main>
            <section className='body'>
              {params.tab.toLowerCase() === 'edit-details' ? (
                <NamespaceForm
                  userId={userId}
                  namespace={namespace}
                  errorMessages={errorMessages}
                  updateNamespace={(namespace) =>
                    this.setState({
                      namespace: namespace,
                      unsavedData: true,
                    })
                  }
                />
              ) : (
                <ResourcesForm
                  updateNamespace={(namespace) =>
                    this.setState({
                      namespace: namespace,
                      unsavedData: true,
                    })
                  }
                  namespace={namespace}
                />
              )}
              <Form>
                <ActionGroup>
                  <Button
                    variant='primary'
                    onClick={() => this.saveNamespace()}
                  >
                    {t`Save`}
                  </Button>
                  <Button variant='secondary' onClick={() => this.cancel()}>
                    {t`Cancel`}
                  </Button>

                  {saving ? <Spinner></Spinner> : null}
                </ActionGroup>
                {this.state.unsavedData ? (
                  <div
                    style={{ color: 'red' }}
                  >{t`You have unsaved changes`}</div>
                ) : null}
              </Form>
            </section>
          </Main>
        )}
      </React.Fragment>
    );
  }

  get updateParams() {
    return ParamHelper.updateParamsMixin();
  }

  private loadNamespace() {
    MyNamespaceAPI.get(this.props.match.params['namespace'])
      .then((response) => {
        // Add an empty link to the end of the links array to create an empty field
        // on the link edit form for adding new links
        const emptyLink: NamespaceLinkType = { name: '', url: '' };
        response.data.links.push(emptyLink);
        this.setState({ loading: false, namespace: response.data });
      })
      .catch(() => {
        this.setState({ unauthorized: true, loading: false });
      });
  }

  private saveNamespace() {
    this.setState({ saving: true }, () => {
      const namespace = { ...this.state.namespace };
      const setLinks: NamespaceLinkType[] = [];

      // remove any empty links from the list before saving
      for (const link of namespace.links) {
        if (link.url !== '' || link.name !== '') {
          setLinks.push(link);
        }
      }

      namespace.links = setLinks;

      MyNamespaceAPI.update(this.state.namespace.name, namespace)
        .then((result) => {
          this.setState(
            {
              namespace: result.data,
              errorMessages: {},
              saving: false,
              unsavedData: false,
              redirect: formatPath(Paths.myCollections, {
                namespace: this.state.namespace.name,
              }),
            },
            () =>
              this.context.setAlerts([
                ...this.context.alerts,
                {
                  variant: 'success',
                  title: <Trans>Saved changes to namespace <b>{this.state.namespace.name}</b>.</Trans>,
                },
              ]),
          );
        })
        .catch((error) => {
          const result = error.response;
          if (result.status === 400) {
            this.setState({
              errorMessages: mapErrorMessages(error),
              saving: false,
            });
          } else if (result.status === 404) {
            this.setState({
              alerts: this.state.alerts.concat({
                variant: 'danger',
                title: t`API Error: ${error.response.status}`,
                description: t`You don't have permissions to update this namespace.`,
              }),
              saving: false,
            });
          }
        });
    });
  }
  private get closeAlert() {
    return closeAlertMixin('alerts');
  }

  private cancel() {
    this.setState({
      redirect: formatPath(Paths.myCollections, {
        namespace: this.state.namespace.name,
      }),
    });
  }
}

EditNamespace.contextType = AppContext;

export default withRouter(EditNamespace);
