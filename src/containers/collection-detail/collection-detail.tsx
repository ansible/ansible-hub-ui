import { isEqual } from 'lodash';
import React from 'react';
import {
  AlertList,
  CollectionHeader,
  CollectionInfo,
  LoadingPageWithHeader,
  Main,
  closeAlertMixin,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath, namespaceBreadcrumb } from 'src/paths';
import { ParamHelper, RouteProps, withRouter } from 'src/utilities';
import { IBaseCollectionState, loadCollection } from './base';

// renders collection level information
class CollectionDetail extends React.Component<
  RouteProps,
  IBaseCollectionState
> {
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
      return <LoadingPageWithHeader />;
    }

    const { collection_version: version } = collection;

    const breadcrumbs = [
      namespaceBreadcrumb(),
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
      <React.Fragment>
        <AlertList alerts={alerts} closeAlert={(i) => this.closeAlert(i)} />
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
          repo={this.props.routeParams.repo}
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
      </React.Fragment>
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

  get updateParams() {
    return ParamHelper.updateParamsMixin();
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

export default withRouter(CollectionDetail);

CollectionDetail.contextType = AppContext;
