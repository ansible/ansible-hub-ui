import { t } from '@lingui/macro';
import { DataList } from '@patternfly/react-core';
import * as React from 'react';
import { LegacyNamespaceListType } from 'src/api';
import { LegacyNamespaceAPI } from 'src/api/legacynamespace';
import {
  AlertList,
  AlertType,
  BaseHeader,
  CollectionFilter,
  EmptyStateNoData,
  LegacyNamespaceListItem,
  LoadingPageSpinner,
  Pagination,
  WisdomModal,
  closeAlertMixin,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { RouteProps, withRouter } from 'src/utilities';
import './legacy-namespaces.scss';

interface LegacyNamespacesProps {
  legacynamespaces: LegacyNamespaceListType[];
  loading: boolean;
  mounted: boolean;
  count: number;
  params: {
    page?: number;
    page_size?: number;
    order_by?: string;
    keywords?: string;
  };
  updateParams: (params) => void;
  ignoredParams: string[];
  isOpenWisdomModal: boolean;
  wisdomReference: string;
  alerts: AlertType[];
}

class LegacyNamespaces extends React.Component<
  RouteProps,
  LegacyNamespacesProps
> {
  constructor(props) {
    super(props);
    this.state = {
      ...props,
      params: {
        page: 1,
        page_size: 10,
        order_by: 'name',
        keywords: null,
      },
      loading: true,
      mounted: false,
      count: 0,
      legacynamespaces: [],
      isOpenWisdomModal: false,
      wisdomReference: null,
      alerts: [],
    };
  }

  componentDidMount() {
    const thisQS = window.location.search;
    const urlParams = new URLSearchParams(thisQS);
    this.updateParams({
      page: parseInt(urlParams.get('page'), 10) || 1,
      page_size: parseInt(urlParams.get('page_size'), 10) || 10,
      order_by: urlParams.get('order_by') || 'name',
      keywords: urlParams.get('keywords') || null,
    });
  }

  updateParams = (p) => {
    const { page, page_size, order_by, keywords } = p;
    this.setState({ loading: true }, () => {
      LegacyNamespaceAPI.list({
        page: page,
        page_size: page_size,
        order_by: order_by,
        keywords: keywords,
      }).then((response) => {
        this.setState(() => ({
          mounted: true,
          loading: false,
          params: {
            page: page,
            page_size: page_size,
            order_by: order_by,
            keywords: keywords,
          },
          count: response.data.count,
          legacynamespaces: response.data.results,
        }));
      });
    });
  };

  openModal(namespace) {
    this.setState({ isOpenWisdomModal: true, wisdomReference: namespace.name });
  }

  private addAlert(alert: AlertType) {
    this.setState({
      alerts: [...this.state.alerts, alert],
    });
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }

  render() {
    const ignoredParams = [
      'namespace',
      'repository__name',
      'page',
      'page_size',
      'sort',
      'tag',
      'tags',
      'view_type',
      'order_by',
    ];

    // do not pass null'ish params to the filter widget
    const cleanParams = {};
    for (const [key, value] of Object.entries(this.state.params)) {
      if (ignoredParams.includes(key)) {
        continue;
      }
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value;
      }
    }

    const { loading, legacynamespaces } = this.state;
    const noData = legacynamespaces.length === 0;

    return (
      <div>
        <AlertList
          alerts={this.state.alerts}
          closeAlert={(i) => this.closeAlert(i)}
        />
        {this.state.isOpenWisdomModal && (
          <WisdomModal
            addAlert={(alert) => this.addAlert(alert)}
            closeAction={() => this.setState({ isOpenWisdomModal: false })}
            scope={'legacy_namespace'}
            reference={this.state.wisdomReference}
          />
        )}
        <BaseHeader title={t`Legacy Namespaces`}></BaseHeader>
        <React.Fragment>
          {loading ? (
            <LoadingPageSpinner />
          ) : noData ? (
            <EmptyStateNoData
              title={t`No namespaces yet`}
              description={t`Namespaces will appear once created or roles are imported`}
            />
          ) : (
            <div>
              <CollectionFilter
                ignoredParams={ignoredParams}
                params={cleanParams}
                updateParams={this.updateParams}
              />

              <Pagination
                params={this.state.params}
                updateParams={this.updateParams}
                count={this.state.count}
              />

              <DataList aria-label={t`List of Legacy Namespaces`}>
                {this.state.legacynamespaces &&
                  this.state.legacynamespaces.map((lnamespace) => (
                    <LegacyNamespaceListItem
                      key={lnamespace.id}
                      namespace={lnamespace}
                      openModal={(namespace) => this.openModal(namespace)}
                    />
                  ))}
              </DataList>

              <Pagination
                params={this.state.params}
                updateParams={this.updateParams}
                count={this.state.count}
              />
            </div>
          )}
        </React.Fragment>
      </div>
    );
  }
}

export default withRouter(LegacyNamespaces);

LegacyNamespaces.contextType = AppContext;
