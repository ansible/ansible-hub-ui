import * as React from 'react';

import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';

import {
  PartnerHeader,
  NamespaceForm,
  ResourcesForm,
  AlertList,
  closeAlertMixin,
  AlertType,
  Main,
  EmptyStateUnauthorized,
} from 'src/components';
import {
  MyNamespaceAPI,
  NamespaceType,
  ActiveUserAPI,
  NamespaceLinkType,
} from 'src/api';

import { Form, ActionGroup, Button, Spinner } from '@patternfly/react-core';

import { formatPath, namespaceBreadcrumb, Paths } from 'src/paths';
import { ParamHelper, mapErrorMessages } from 'src/utilities';

interface IState {
  namespace: NamespaceType;
  newLinkName: string;
  newLinkURL: string;
  errorMessages: any;
  saving: boolean;
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
      params['tab'] = 'edit details';
    }

    this.state = {
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
    ActiveUserAPI.getUser().then(result => {
      this.setState({ userId: result.account_number }, () =>
        this.loadNamespace(),
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
    } = this.state;

    if (!namespace) {
      return null;
    }

    if (redirect) {
      return <Redirect to={redirect} />;
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
            { name: 'Edit' },
          ]}
          tabs={['Edit details', 'Edit resources']}
          params={params}
          updateParams={p => this.updateParams(p)}
        ></PartnerHeader>
        <AlertList
          alerts={this.state.alerts}
          closeAlert={i => this.closeAlert(i)}
        />
        {unauthorized ? (
          <EmptyStateUnauthorized />
        ) : (
          <Main>
            <section className='body'>
              {params.tab.toLowerCase() === 'edit details' ? (
                <NamespaceForm
                  userId={userId}
                  namespace={namespace}
                  errorMessages={errorMessages}
                  updateNamespace={namespace =>
                    this.setState({
                      namespace: namespace,
                      unsavedData: true,
                    })
                  }
                />
              ) : (
                <ResourcesForm
                  updateNamespace={namespace =>
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
                    Save
                  </Button>
                  <Button variant='secondary' onClick={() => this.cancel()}>
                    Cancel
                  </Button>

                  {saving ? <Spinner></Spinner> : null}
                </ActionGroup>
                {this.state.unsavedData ? (
                  <div style={{ color: 'red' }}>You have unsaved changes</div>
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
      .then(response => {
        // Add an empty link to the end of the links array to create an empty field
        // on the link edit form for adding new links
        const emptyLink: NamespaceLinkType = { name: '', url: '' };
        response.data.links.push(emptyLink);
        this.setState({ namespace: response.data });
      })
      .catch(response => {
        this.setState({ unauthorized: true });
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
        .then(result => {
          this.setState({
            namespace: result.data,
            errorMessages: {},
            saving: false,
            unsavedData: false,
            redirect: formatPath(Paths.myCollections, {
              namespace: this.state.namespace.name,
            }),
          });
        })
        .catch(error => {
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
                title: `API Error: ${error.response.status}`,
                description: `You don't have permissions to update this namespace.`,
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

export default withRouter(EditNamespace);
