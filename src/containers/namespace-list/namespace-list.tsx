import * as React from 'react';
import './namespace-list.scss';

import { RouteComponentProps, Link } from 'react-router-dom';
import { Section } from '@redhat-cloud-services/frontend-components';
import {
  EmptyState,
  EmptyStateIcon,
  Title,
  EmptyStateBody,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

import { ParamHelper } from '../../utilities/param-helper';
import {
  BaseHeader,
  NamespaceCard,
  Toolbar,
  Pagination,
  NamespaceModal,
  LoadingPageWithHeader,
  LoadingPageSpinner,
} from '../../components';
import { Button } from '@patternfly/react-core';
import { ToolbarItem } from '@patternfly/react-core';
import { NamespaceAPI, NamespaceListType, MyNamespaceAPI } from '../../api';
import { Paths, formatPath } from '../../paths';
import { Constants } from '../../constants';
import { AppContext } from '../../loaders/standalone/app-context';

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
    const { activeUser } = this.context;

    if (!namespaces) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    let extra = [];

    if (
      !!activeUser &&
      activeUser.model_permissions.add_namespace &&
      filterOwner
    ) {
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
        </BaseHeader>
        <Section className='card-area'>{this.renderBody()}</Section>
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
      </div>
    );
  }

  private renderBody() {
    const { namespaces, hasPermission } = this.state;
    const { namespacePath } = this.props;
    const { loading } = this.state;

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
          <EmptyState className='empty' variant={EmptyStateVariant.full}>
            <EmptyStateIcon icon={SearchIcon} />
            <Title headingLevel='h2' size='lg'>
              {hasPermission ? 'No results found' : 'No managed namespaces'}
            </Title>
            <EmptyStateBody>
              {hasPermission
                ? 'No results match the filter criteria.' +
                  ' Remove all filters or clear all filters' +
                  ' to show results.'
                : 'This account is not set up to manage any namespaces.'}
            </EmptyStateBody>
            {hasPermission && (
              <Button
                variant='link'
                onClick={() =>
                  this.updateParams({}, () => this.loadNamespaces())
                }
              >
                Clear all filters
              </Button>
            )}
          </EmptyState>
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
