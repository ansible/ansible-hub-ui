import * as React from 'react';
import './namespace-list.scss';

import { RouteComponentProps } from 'react-router-dom';
import { Section } from '@redhat-cloud-services/frontend-components';

import { ParamHelper } from '../../utilities/param-helper';
import {
  BaseHeader,
  NamespaceCard,
  Toolbar,
  Pagination,
  NamespaceModal,
  LoadingPageWithHeader,
  LoadingPageSpinner,
  EmptyStateFilter,
  EmptyStateNoData,
} from '../../components';
import { Button } from '@patternfly/react-core';
import { ToolbarItem } from '@patternfly/react-core';
import { NamespaceAPI, NamespaceListType, MyNamespaceAPI } from '../../api';
import { Paths, formatPath } from '../../paths';
import { Constants } from '../../constants';
import { AppContext } from '../../loaders/app-context';
import { filterIsSet } from '../../utilities';

interface IState {
  namespaces: NamespaceListType[];
  itemCount: number;
  params: {
    name?: string;
    sort?: string;
    page?: number;
    page_size?: number;
    tenant?: string;
  };
  hasPermission: boolean;
  isModalOpen: boolean;
  loading: boolean;
}

interface IProps extends RouteComponentProps {
  title: string;
  namespacePath: Paths;
  filterOwner?: boolean;
}

export class NamespaceList extends React.Component<IProps, IState> {
  nonURLParams = ['tenant'];

  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    if (!params['page_size']) {
      params['page_size'] = 24;
    }

    if (!params['sort']) {
      params['sort'] = 'name';
    }

    this.state = {
      namespaces: undefined,
      itemCount: 0,
      params: params,
      hasPermission: true,
      isModalOpen: false,
      loading: true,
    };
  }

  private handleModalToggle = () => {
    this.setState(({ isModalOpen }) => ({
      isModalOpen: !isModalOpen,
    }));
  };

  componentDidMount() {
    if (this.props.filterOwner) {
      // Make a query with no params and see if it returns results to tell
      // if the user can edit namespaces
      MyNamespaceAPI.list({}).then(results => {
        if (results.data.meta.count !== 0) {
          this.loadNamespaces();
        } else {
          this.setState({
            hasPermission: false,
            namespaces: [],
            loading: false,
          });
        }
      });
    } else {
      this.loadNamespaces();
    }
  }

  render() {
    const { namespaces, params, itemCount } = this.state;
    const { title, filterOwner } = this.props;
    const { user } = this.context;
    const noData =
      !filterIsSet(this.state.params, ['keywords']) && namespaces.length === 0;

    if (!namespaces) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    let extra = [];

    if (!!user && user.model_permissions.add_namespace && filterOwner) {
      extra.push(
        <ToolbarItem key='create-button'>
          <Button variant='primary' onClick={this.handleModalToggle}>
            Create
          </Button>
        </ToolbarItem>,
      );
    }

    return (
      <div className='namespace-page'>
        <NamespaceModal
          isOpen={this.state.isModalOpen}
          toggleModal={this.handleModalToggle}
          onCreateSuccess={result =>
            this.props.history.push(
              formatPath(Paths.myCollections, {
                namespace: result['name'],
              }),
            )
          }
        ></NamespaceModal>
        <BaseHeader title={title}>
          {noData ? null : (
            <div className='toolbar'>
              <Toolbar
                params={params}
                sortOptions={[{ title: 'Name', id: 'name', type: 'alpha' }]}
                searchPlaceholder={'Search ' + title.toLowerCase()}
                updateParams={p =>
                  this.updateParams(p, () => this.loadNamespaces())
                }
                extraInputs={extra}
              />
              <div>
                <Pagination
                  params={params}
                  updateParams={p =>
                    this.updateParams(p, () => this.loadNamespaces())
                  }
                  count={itemCount}
                  isCompact
                  perPageOptions={Constants.CARD_DEFAULT_PAGINATION_OPTIONS}
                />
              </div>
            </div>
          )}
        </BaseHeader>
        <Section className='card-area'>{this.renderBody()}</Section>
        {noData ? null : (
          <Section className='footer'>
            <Pagination
              params={params}
              updateParams={p =>
                this.updateParams(p, () => this.loadNamespaces())
              }
              perPageOptions={Constants.CARD_DEFAULT_PAGINATION_OPTIONS}
              count={itemCount}
            />
          </Section>
        )}
      </div>
    );
  }

  private renderBody() {
    const { namespaces, loading } = this.state;
    const { namespacePath, filterOwner } = this.props;
    const noDataTitle = Constants.STANDALONE_DEPLOYMENT_MODE
      ? 'No namespaces yet'
      : 'No managed namespaces yet';
    const noDataDescription = Constants.STANDALONE_DEPLOYMENT_MODE
      ? 'Namespaces will appear once created'
      : 'This account is not set up to manage any namespaces';
    const noDataButton =
      Constants.STANDALONE_DEPLOYMENT_MODE && filterOwner ? (
        <Button variant='primary' onClick={() => this.handleModalToggle()}>
          Create
        </Button>
      ) : null;

    if (loading) {
      return (
        <Section>
          <LoadingPageSpinner></LoadingPageSpinner>;
        </Section>
      );
    }

    if (namespaces.length === 0) {
      return (
        <Section>
          {filterIsSet(this.state.params, ['keywords']) ? (
            <EmptyStateFilter />
          ) : (
            <EmptyStateNoData
              title={noDataTitle}
              description={noDataDescription}
              button={noDataButton}
            />
          )}
        </Section>
      );
    }

    return (
      <Section className='card-layout'>
        {namespaces.map((ns, i) => (
          <div key={i} className='card-wrapper'>
            <NamespaceCard
              namespaceURL={formatPath(namespacePath, {
                namespace: ns.name,
                repo: this.context.selectedRepo,
              })}
              key={i}
              {...ns}
            ></NamespaceCard>
          </div>
        ))}
      </Section>
    );
  }

  private loadNamespaces() {
    let apiFunc: any;

    if (this.props.filterOwner) {
      apiFunc = p => MyNamespaceAPI.list(p);
    } else {
      apiFunc = p => NamespaceAPI.list(p);
    }
    this.setState({ loading: true }, () => {
      apiFunc(this.state.params).then(results => {
        this.setState({
          namespaces: results.data.data,
          itemCount: results.data.meta.count,
          loading: false,
        });
      });
    });
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin(this.nonURLParams);
  }
}

NamespaceList.contextType = AppContext;
