import { Trans, t } from '@lingui/macro';
import { ActionGroup, Button, Form } from '@patternfly/react-core';
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import {
  MyNamespaceAPI,
  type NamespaceLinkType,
  type NamespaceType,
} from 'src/api';
import {
  AlertList,
  type AlertType,
  EmptyStateUnauthorized,
  LoadingSpinner,
  Main,
  NamespaceForm,
  PartnerHeader,
  ResourcesForm,
  Spinner,
  closeAlert,
  validateName,
  validateURL,
} from 'src/components';
import { AppContext, type IAppContextType } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import {
  type ErrorMessagesType,
  ParamHelper,
  type RouteProps,
  jsxErrorMessage,
  mapErrorMessages,
  withRouter,
} from 'src/utilities';

interface IState {
  alerts: AlertType[];
  errorMessages: ErrorMessagesType;
  loading: boolean;
  namespace: NamespaceType;
  newLinkName: string;
  newLinkURL: string;
  params: {
    tab?: string;
  };
  redirect: string;
  saving: boolean;
  unauthorized: boolean;
  unsavedData: boolean;
}

class EditNamespace extends Component<RouteProps, IState> {
  static contextType = AppContext;

  queryParams: URLSearchParams;

  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search);

    if (!params['tab']) {
      params['tab'] = 'edit-details';
    }

    this.state = {
      alerts: [],
      errorMessages: {},
      loading: false,
      namespace: null,
      newLinkName: '',
      newLinkURL: '',
      params,
      redirect: null,
      saving: false,
      unauthorized: false,
      unsavedData: false,
    };
  }

  componentDidMount() {
    this.setState({ loading: true }, () => this.loadNamespace());
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.search !== this.props.location.search) {
      const params = ParamHelper.parseParamString(this.props.location.search);
      this.setState({ params });
    }
  }

  render() {
    const {
      alerts,
      errorMessages,
      loading,
      namespace,
      params,
      redirect,
      saving,
      unauthorized,
    } = this.state;

    if (redirect) {
      return <Navigate to={redirect} />;
    }

    if (loading) {
      return <LoadingSpinner />;
    }

    if (!namespace) {
      return null;
    }

    const tabs = [
      {
        active: params.tab === 'edit-details',
        title: t`Edit details`,
        link: formatPath(
          Paths.editNamespace,
          { namespace: namespace.name },
          { tab: 'edit-details' },
        ),
      },
      {
        active: params.tab === 'edit-resources',
        title: t`Edit resources`,
        link: formatPath(
          Paths.editNamespace,
          { namespace: namespace.name },
          { tab: 'edit-resources' },
        ),
      },
    ];

    const updateNamespace = (namespace) =>
      this.setState({
        namespace,
        unsavedData: true,
      });

    return (
      <>
        <PartnerHeader
          namespace={namespace}
          breadcrumbs={[
            { name: t`Namespaces`, url: formatPath(Paths.namespaces) },
            {
              name: namespace.name,
              url: formatPath(Paths.namespaceDetail, {
                namespace: namespace.name,
              }),
            },
            { name: t`Edit` },
          ]}
          tabs={tabs}
        />
        <AlertList
          alerts={alerts}
          closeAlert={(i) =>
            closeAlert(i, {
              alerts,
              setAlerts: (alerts) => this.setState({ alerts }),
            })
          }
        />
        {unauthorized ? (
          <EmptyStateUnauthorized />
        ) : (
          <Main>
            <section className='body'>
              {params.tab === 'edit-details' ? (
                <NamespaceForm
                  errorMessages={errorMessages}
                  namespace={namespace}
                  updateNamespace={updateNamespace}
                />
              ) : null}
              {params.tab === 'edit-resources' ? (
                <ResourcesForm
                  namespace={namespace}
                  updateNamespace={updateNamespace}
                />
              ) : null}
              <Form>
                <ActionGroup>
                  <Button
                    isDisabled={this.isSaveDisabled()}
                    variant='primary'
                    onClick={() => this.saveNamespace()}
                  >
                    {t`Save`}
                  </Button>
                  <Button variant='secondary' onClick={() => this.cancel()}>
                    {t`Cancel`}
                  </Button>

                  {saving ? <Spinner /> : null}
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
      </>
    );
  }

  private isSaveDisabled() {
    const namespace = this.state.namespace;
    return namespace.links.some(
      (link) =>
        validateName(link).variant == 'error' ||
        validateURL(link).variant == 'error',
    );
  }

  private loadNamespace() {
    MyNamespaceAPI.get(this.props.routeParams.namespace)
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
              redirect: formatPath(Paths.namespaceDetail, {
                namespace: this.state.namespace.name,
              }),
            },
            () =>
              (this.context as IAppContextType).queueAlert({
                variant: 'success',
                title: (
                  <Trans>
                    Saved changes to namespace &quot;
                    {this.state.namespace.name}&quot;.
                  </Trans>
                ),
              }),
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
                title: t`Changes to namespace "${this.state.namespace.name}" could not be saved.`,
                description: jsxErrorMessage(result.status, result.statusText),
              }),
              saving: false,
            });
          }
        });
    });
  }

  private cancel() {
    this.setState({
      redirect: formatPath(Paths.namespaceDetail, {
        namespace: this.state.namespace.name,
      }),
    });
  }
}

export default withRouter(EditNamespace);
