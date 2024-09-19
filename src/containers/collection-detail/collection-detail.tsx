import { t } from '@lingui/macro';
import { isEqual } from 'lodash';
import React, { Component } from 'react';
import {
  AlertList,
  CollectionHeader,
  CollectionInfo,
  LoadingPage,
  Main,
  closeAlert,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import { ParamHelper, type RouteProps, withRouter } from 'src/utilities';
import { type IBaseCollectionState, loadCollection } from './base';

// renders collection level information
class CollectionDetail extends Component<RouteProps, IBaseCollectionState> {
  static contextType = AppContext;

  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search);

    this.state = {
      actuallyCollection: null,
      alerts: [],
      collection: null,
      collections: [],
      collectionsCount: 0,
      content: null,
      distroBasePath: null,
      params,
    };
  }

  componentDidMount() {
    this.loadCollections(true);
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.location, this.props.location)) {
      this.loadCollections(false);
    }
  }

  render() {
    const {
      actuallyCollection,
      alerts,
      collection,
      collections,
      collectionsCount,
      content,
      params,
    } = this.state;

    if (collections.length <= 0) {
      return <LoadingPage />;
    }

    const { collection_version: version } = collection;

    const breadcrumbs = [
      { name: t`Namespaces`, url: formatPath(Paths.namespaces) },
      {
        url: formatPath(Paths.namespaceDetail, {
          namespace: version.namespace,
        }),
        name: version.namespace,
      },
      {
        name: version.name,
      },
    ];

    return (
      <>
        <AlertList
          alerts={alerts}
          closeAlert={(i) =>
            closeAlert(i, {
              alerts,
              setAlerts: (alerts) => this.setState({ alerts }),
            })
          }
        />
        <CollectionHeader
          activeTab='install'
          actuallyCollection={actuallyCollection}
          breadcrumbs={breadcrumbs}
          collection={collection}
          collections={collections}
          collectionsCount={collectionsCount}
          content={content}
          params={params}
          reload={() => this.loadCollections(true)}
          updateParams={(p) =>
            this.updateParams(p, () => this.loadCollections(true))
          }
        />
        <Main>
          <section className='body'>
            <CollectionInfo
              {...collection}
              content={content}
              updateParams={(p) => this.updateParams(p)}
              params={this.state.params}
              addAlert={(variant, title, description) =>
                this.setState({
                  alerts: [
                    ...this.state.alerts,
                    {
                      variant,
                      title,
                      description,
                    },
                  ],
                })
              }
            />
          </section>
        </Main>
      </>
    );
  }

  private loadCollections(forceReload) {
    loadCollection({
      forceReload,
      matchParams: this.props.routeParams,
      navigate: this.props.navigate,
      setCollection: (
        collections,
        collection,
        content,
        collectionsCount,
        actuallyCollection,
      ) =>
        this.setState({
          collections,
          collection,
          content,
          collectionsCount,
          actuallyCollection,
        }),
      stateParams: this.state.params,
    });
  }

  private updateParams(params, callback = null) {
    ParamHelper.updateParams({
      params,
      navigate: (to) => this.props.navigate(to),
      setState: (state) => this.setState(state, callback),
    });
  }
}

export default withRouter(CollectionDetail);
