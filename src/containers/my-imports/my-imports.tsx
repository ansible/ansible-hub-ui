import { t } from '@lingui/macro';
import * as React from 'react';
import './my-imports.scss';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { cloneDeep } from 'lodash';

import { BaseHeader, ImportConsole, ImportList, Main } from 'src/components';

import {
  ImportAPI,
  ImportDetailType,
  ImportListType,
  NamespaceType,
  PulpStatus,
  MyNamespaceAPI,
  CollectionVersion,
  CollectionVersionAPI,
} from 'src/api';

import { ParamHelper } from 'src/utilities/param-helper';

interface IState {
  selectedImport: ImportListType;
  importList: ImportListType[];
  selectedImportDetails: ImportDetailType;
  selectedCollectionVersion: CollectionVersion;
  params: {
    page_size?: number;
    page?: number;
    keyword?: string;
    namespace?: string;
  };
  namespaces: NamespaceType[];
  resultsCount: number;
  importDetailError: string;
  followLogs: boolean;
  loadingImports: boolean;
  loadingImportDetails: boolean;
}

class MyImports extends React.Component<RouteComponentProps, IState> {
  polling: any;
  topOfPage: any;

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
      namespaces: [],
      selectedImportDetails: undefined,
      resultsCount: 0,
      importDetailError: '',
      followLogs: false,
      loadingImports: true,
      loadingImportDetails: true,
      selectedCollectionVersion: undefined,
    };
  }

  componentDidMount() {
    // Load namespaces, use the namespaces to query the import list,
    // use the import list to load the task details
    this.loadNamespaces(() =>
      this.loadImportList(() => this.loadTaskDetails()),
    );

    this.polling = setInterval(() => {
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

  render() {
    const {
      selectedImport,
      importList,
      params,
      namespaces,
      selectedImportDetails,
      resultsCount,
      loadingImports,
      loadingImportDetails,
      importDetailError,
      followLogs,
      selectedCollectionVersion,
    } = this.state;

    if (!importList) {
      return null;
    }

    return (
      <React.Fragment>
        <div ref={this.topOfPage}></div>
        <BaseHeader title={t`My imports`} />
        <Main>
          <section className='body'>
            <div className='hub-page-container'>
              <div className='import-list'>
                <ImportList
                  importList={importList}
                  selectedImport={selectedImport}
                  loading={loadingImports}
                  numberOfResults={resultsCount}
                  params={params}
                  namespaces={namespaces}
                  selectImport={(sImport) => this.selectImport(sImport)}
                  updateParams={(params) => {
                    this.updateParams(params, () =>
                      this.setState(
                        {
                          loadingImports: true,
                          loadingImportDetails: true,
                        },
                        () => this.loadImportList(() => this.loadTaskDetails()),
                      ),
                    );
                  }}
                />
              </div>

              <div className='hub-import-console'>
                <ImportConsole
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
                  collectionVersion={selectedCollectionVersion}
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

  private loadNamespaces(callback?: () => void) {
    MyNamespaceAPI.list({ page_size: 1000 })
      .then((result) => {
        const namespaces = result.data.data;
        let selectedNS;

        if (this.state.params.namespace) {
          selectedNS = namespaces.find(
            (x) => x.name === this.state.params.namespace,
          );
        }

        if (!selectedNS) {
          selectedNS = namespaces[0];
        }

        this.setState(
          {
            namespaces: namespaces,
            params: {
              ...this.state.params,
              namespace: selectedNS.name,
            },
          },
          callback,
        );
      })
      .catch((result) => console.log(result));
  }

  private loadImportList(callback?: () => void) {
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
              selectedCollectionVersion: undefined,
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
                      selectedCollectionVersion: result.data.data[0],
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
