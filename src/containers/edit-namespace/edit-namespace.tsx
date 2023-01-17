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
} from 'src/components';
import { MyNamespaceAPI, NamespaceType, NamespaceLinkType } from 'src/api';

import { ActionGroup, Button, Form, Spinner } from '@patternfly/react-core';

import { Paths, formatPath } from 'src/paths';
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
      newLinkURL: '',
      newLinkName: '',
      errorMessages: {},
      saving: false,
      redirect: null,
      unsavedData: false,
      params: params,
    };
  }

  componentDidMount() {
    this.loadNamespace();
  }

  render() {
    const { namespace, errorMessages, saving, redirect, params } = this.state;

    if (redirect) {
      return <Redirect to={redirect} />;
    }

    if (!namespace) {
      return null;
    }
    return (
      <React.Fragment>
        <PartnerHeader
          namespace={namespace}
          breadcrumbs={[
            { name: 'My namespaces', url: Paths.myNamespaces },
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
          updateParams={(p) => this.updateParams(p)}
        ></PartnerHeader>
        <AlertList
          alerts={this.state.alerts}
          closeAlert={(i) => this.closeAlert(i)}
        />
        <Main>
          <section className='body'>
            {params.tab.toLowerCase() === 'edit details' ? (
              <NamespaceForm
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
                <Button variant='primary' onClick={() => this.saveNamespace()}>
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
        this.setState({ namespace: response.data });
      })
      .catch((response) => {
        this.setState({ redirect: Paths.notFound });
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
