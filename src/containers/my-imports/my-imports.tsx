import { t } from '@lingui/macro';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  CollectionVersionAPI,
  CollectionVersionSearch,
  ImportAPI,
  ImportDetailType,
  ImportListType,
  PulpStatus,
} from 'src/api';
import {
  AlertList,
  AlertType,
  BaseHeader,
  ImportConsole,
  ImportList,
  Main,
  closeAlertMixin,
} from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { ParamHelper, RouteProps, withRouter } from 'src/utilities';

interface IState {
  alerts: AlertType[];
  collection: CollectionVersionSearch;
  followLogs: boolean;
  importDetailError: string;
  importList: ImportListType[];
  loadingImportDetails: boolean;
  loadingImports: boolean;
  params: {
    keyword?: string;
    namespace?: string;
    page?: number;
    page_size?: number;
  };
  resultsCount: number;
  selectedImport: ImportListType;
  selectedImportDetails: ImportDetailType;
}

class MyImports extends React.Component<RouteProps, IState> {
  polling: ReturnType<typeof setInterval>;
  topOfPage: React.RefObject<HTMLDivElement>;

  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    this.topOfPage = React.createRef();

    this.state = {
      alerts: [],
      collection: null,
      followLogs: false,
      importDetailError: '',
      importList: [],
      loadingImportDetails: true,
      loadingImports: true,
      params,
      resultsCount: 0,
      selectedImport: undefined,
      selectedImportDetails: undefined,
    };
  }

  componentDidMount() {
    // Load namespaces, use the namespaces to query the import list,
    // use the import list to load the task details
    this.loadImportList(() => this.loadTaskDetails());

    this.polling = setInterval(() => {
      if (!this.state.params.namespace) {
        return;
      }

      const { selectedImport, selectedImportDetails } = this.state;
      const allowedStates = [PulpStatus.running, PulpStatus.waiting];

      // selectedImportDetails can be failed while selectedImport is still running, poll() updates selectedImport
      if (
        allowedStates.includes(selectedImportDetails?.state) ||
        allowedStates.includes(selectedImport?.state)
      ) {
        this.poll();
      }
    }, 10000);
  }

  componentWillUnmount() {
    clearInterval(this.polling);
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }

  private addAlert(alert) {
    this.setState({
      alerts: [...this.state.alerts, alert],
    });
  }

  render() {
    const {
      collection,
      followLogs,
      importDetailError,
      importList,
      loadingImportDetails,
      loadingImports,
      params,
      resultsCount,
      selectedImport,
      selectedImportDetails,
    } = this.state;

    if (!importList) {
      return null;
    }

    return (
      <>
        <div ref={this.topOfPage} />
        <BaseHeader title={t`My imports`} />
        <AlertList
          alerts={this.state.alerts}
          closeAlert={(i) => this.closeAlert(i)}
        />
        <Main>
          <section className='body'>
            <div style={{ display: 'flex' }} data-cy='MyImports'>
              <div style={{ width: '400px' }}>
                <ImportList
                  addAlert={(alert) => this.addAlert(alert)}
                  importList={importList}
                  selectedImport={selectedImport}
                  loading={loadingImports}
                  numberOfResults={resultsCount}
                  params={params}
                  selectImport={(sImport) => this.selectImport(sImport)}
                  updateParams={(params) => {
                    this.updateParams(params, () => {
                      if (params.namespace) {
                        this.setState(
                          {
                            loadingImports: true,
                            loadingImportDetails: true,
                          },
                          () =>
                            this.loadImportList(() => this.loadTaskDetails()),
                        );
                      } else {
                        this.setState({
                          importDetailError: t`No data`,
                          loadingImportDetails: false,
                        });
                      }
                    });
                  }}
                />
              </div>

              <div style={{ flexGrow: '1', marginLeft: '16px' }}>
                {selectedImport && this.state.params.namespace && (
                  <div
                    style={{
                      fontSize: '18px',
                      padding: '10px 10px 0 10px',
                    }}
                  >
                    {!collection ? (
                      `${selectedImport.namespace}.${selectedImport.name}`
                    ) : (
                      <Link
                        to={formatPath(
                          Paths.collectionByRepo,
                          {
                            namespace: selectedImport.namespace,
                            collection: selectedImport.name,
                            repo: collection.repository.name,
                          },
                          {
                            version: selectedImport.version,
                          },
                        )}
                      >
                        {selectedImport.namespace}.{selectedImport.name}
                      </Link>
                    )}
                  </div>
                )}

                <ImportConsole
                  apiError={importDetailError}
                  collection={collection}
                  empty={!this.state.params.namespace}
                  followMessages={followLogs}
                  loading={loadingImportDetails}
                  selectedImport={selectedImport}
                  setFollowMessages={(followLogs) =>
                    this.setState({ followLogs })
                  }
                  task={selectedImportDetails}
                />
              </div>
            </div>
          </section>
        </Main>
      </>
    );
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
  }

  private selectImport(sImport) {
    this.setState(
      { selectedImport: sImport, loadingImportDetails: true },
      () => {
        this.topOfPage.current.scrollIntoView({
          behavior: 'smooth',
        });
        this.loadTaskDetails();
      },
    );
  }

  private poll() {
    this.loadTaskDetails(() => {
      // Update the state of the selected import in the list if it's
      // different from the one loaded from the API.
      const { selectedImport, selectedImportDetails, importList } = this.state;

      if (!selectedImportDetails) {
        return;
      }

      if (selectedImport.state !== selectedImportDetails.state) {
        const importIndex = importList.findIndex(
          (x) => x.id === selectedImport.id,
        );

        const imports = [...importList];
        const newSelectedImport = {
          ...selectedImport,
          state: selectedImportDetails.state,
          finished_at: selectedImportDetails.finished_at,
        };

        imports[importIndex] = newSelectedImport;

        this.setState({
          selectedImport: newSelectedImport,
          importList: imports,
        });
      }
    });
  }

  private loadImportList(callback?: () => void) {
    if (!this.state.params.namespace) {
      this.setState({
        importDetailError: t`No data`,
        loadingImportDetails: false,
      });
      return;
    }

    ImportAPI.list({ ...this.state.params, sort: '-created' })
      .then((importList) => {
        this.setState(
          {
            importList: importList.data.data,
            selectedImport: importList.data.data[0],
            resultsCount: importList.data.meta.count,
            loadingImports: false,
          },
          callback,
        );
      })
      .catch((result) => console.log(result));
  }

  private loadTaskDetails(callback?: () => void) {
    if (!this.state.selectedImport) {
      this.setState({
        importDetailError: t`No data`,
        loadingImportDetails: false,
      });
    } else {
      ImportAPI.get(this.state.selectedImport.id)
        .then((result) => {
          this.setState(
            {
              importDetailError: '',
              loadingImportDetails: false,
              selectedImportDetails: result.data,
              collection: null,
            },
            () => {
              const { namespace, name, version } =
                this.state.selectedImportDetails;

              // have to use list instead of get because repository_list isn't
              // available on collection version details
              CollectionVersionAPI.list({
                namespace,
                name,
                version,
              })
                .then((result) => {
                  if (result.data.meta.count === 1) {
                    this.setState({
                      collection: result.data.data[0],
                    });
                  }
                })
                .finally(() => {
                  if (callback) {
                    callback();
                  }
                });
            },
          );
        })
        .catch(() => {
          this.setState({
            selectedImportDetails: undefined,
            importDetailError: t`Error fetching import from API`,
            loadingImportDetails: false,
          });
        });
    }
  }
}

export default withRouter(MyImports);
