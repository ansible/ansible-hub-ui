import { t } from '@lingui/macro';
import { cloneDeep } from 'lodash';
import * as React from 'react';
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
import { RouteProps, withRouter } from 'src/utilities';
import { ParamHelper } from 'src/utilities/param-helper';
import './my-imports.scss';

interface IState {
  selectedImport: ImportListType;
  importList: ImportListType[];
  selectedImportDetails: ImportDetailType;
  collection: CollectionVersionSearch;
  params: {
    page_size?: number;
    page?: number;
    keyword?: string;
    namespace?: string;
  };
  resultsCount: number;
  importDetailError: string;
  followLogs: boolean;
  loadingImports: boolean;
  loadingImportDetails: boolean;
  alerts: AlertType[];
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
      selectedImport: undefined,
      importList: [],
      params: params,
      selectedImportDetails: undefined,
      resultsCount: 0,
      importDetailError: '',
      followLogs: false,
      loadingImports: true,
      loadingImportDetails: true,
      collection: null,
      alerts: [],
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
      selectedImport,
      importList,
      params,
      selectedImportDetails,
      resultsCount,
      loadingImports,
      loadingImportDetails,
      importDetailError,
      followLogs,
      collection,
    } = this.state;

    if (!importList) {
      return null;
    }

    return (
      <React.Fragment>
        <div ref={this.topOfPage}></div>
        <BaseHeader title={t`My imports`} />
        <AlertList
          alerts={this.state.alerts}
          closeAlert={(i) => this.closeAlert(i)}
        />
        <Main>
          <section className='body'>
            <div className='hub-page-container' data-cy='MyImports'>
              <div className='import-list'>
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

              <div className='hub-import-console'>
                <ImportConsole
                  empty={!this.state.params.namespace}
                  loading={loadingImportDetails}
                  task={selectedImportDetails}
                  followMessages={followLogs}
                  setFollowMessages={(isFollowing) => {
                    this.setState({
                      followLogs: isFollowing,
                    });
                  }}
                  selectedImport={selectedImport}
                  apiError={importDetailError}
                  collection={collection}
                />
              </div>
            </div>
          </section>
        </Main>
      </React.Fragment>
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

        const imports = cloneDeep(importList);
        const newSelectedImport = cloneDeep(selectedImport);

        newSelectedImport.state = selectedImportDetails.state;
        newSelectedImport.finished_at = selectedImportDetails.finished_at;

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
              const importDeets = this.state.selectedImportDetails;

              // have to use list instead of get because repository_list isn't
              // available on collection version details
              CollectionVersionAPI.list({
                namespace: importDeets.namespace,
                name: importDeets.name,
                version: importDeets.version,
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
