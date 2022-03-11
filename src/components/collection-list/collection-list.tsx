import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import './list.scss';

import { Button, DropdownItem, DataList } from '@patternfly/react-core';

import { CollectionListType, CollectionAPI } from 'src/api';
import { Constants } from 'src/constants';
import {
  CollectionListItem,
  Pagination,
  StatefulDropdown,
  EmptyStateFilter,
  AlertType,
} from 'src/components';
import { ParamHelper } from 'src/utilities/param-helper';
import {
  deleteCollectionUtils,
  getIdFromTask,
  waitForTask,
  errorMessage,
} from 'src/utilities';

interface IProps {
  collections: CollectionListType[];
  params: {
    sort?: string;
    page?: number;
    page_size?: number;
  };
  updateParams: (params) => void;
  itemCount: number;
  ignoredParams: string[];

  showNamespace?: boolean;
  showControls?: boolean;
  handleControlClick?: (id, event) => void;
  repo?: string;
  alerts: AlertType[];
  setAlerts: (alerts) => void;
  reload: () => void;
  context: any;
}

interface IState {
  deleteCollection: CollectionListType;
  confirmDelete: boolean;
  isDeletionPending: boolean;
  collectionVersion: string | null;
}

// only used in namespace detail, collections uses individual items
export class CollectionList extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      deleteCollection: null,
      confirmDelete: false,
      isDeletionPending: false,
      collectionVersion: null,
    };
  }

  render() {
    const {
      collections,
      params,
      updateParams,
      ignoredParams,
      itemCount,
      showControls,
      repo,
    } = this.props;
    const {
      deleteCollection,
      isDeletionPending,
      confirmDelete,
      collectionVersion,
    } = this.state;

    return (
      <React.Fragment>
        {deleteCollectionUtils.deleteModal(
          deleteCollection,
          isDeletionPending,
          confirmDelete,
          collectionVersion,
          () => this.setState({ deleteCollection: null }),
          () => {
            this.setState({ isDeletionPending: true }, () => {
              this.deleteCollection();
            });
          },
          (val) => this.setState({ confirmDelete: val }),
        )}
        <DataList aria-label={t`List of Collections`}>
          {collections.length > 0 ? (
            collections.map((c) => (
              <CollectionListItem
                controls={
                  showControls ? this.renderCollectionControls(c) : null
                }
                key={c.id}
                {...c}
                repo={repo}
              />
            ))
          ) : (
            <EmptyStateFilter
              clearAllFilters={() => {
                ParamHelper.clearAllFilters({
                  params,
                  ignoredParams,
                  updateParams,
                });
              }}
            />
          )}
        </DataList>
        <Pagination
          params={params}
          updateParams={(p) => updateParams(p)}
          count={itemCount}
        />
      </React.Fragment>
    );
  }

  private renderCollectionControls(collection: CollectionListType) {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          onClick={() => this.props.handleControlClick(collection.id, 'upload')}
          variant='secondary'
        >
          {t`Upload new version`}
        </Button>
        <StatefulDropdown
          items={[
            <React.Fragment key='fragment'>
              {deleteCollectionUtils.deleteMenuOption(
                true,
                this.props.context,
                () => this.tryOpenDeleteModalWithConfirm(collection),
              )}
            </React.Fragment>,
            <DropdownItem
              onClick={() =>
                this.props.handleControlClick(collection.id, 'deprecate')
              }
              key='deprecate'
              isDisabled={
                DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE
              }
              description={
                DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE
                  ? t`Temporarily disabled due to sync issues. (AAH-1237)`
                  : null
              }
            >
              {collection.deprecated ? t`Undeprecate` : t`Deprecate`}
            </DropdownItem>,
          ]}
          ariaLabel='collection-kebab'
        />
      </div>
    );
  }

  private tryOpenDeleteModalWithConfirm(collection) {
    deleteCollectionUtils.getUsedbyDependencies(
      collection,
      (noDependencies) =>
        this.openDeleteModalWithConfirm(noDependencies, collection),
      (alerts) =>
        this.props.setAlerts({ alerts: [...this.props.alerts, alerts] }),
    );
  }

  private openDeleteModalWithConfirm(noDependencies, collection) {
    if (noDependencies) {
      this.setState({
        deleteCollection: collection,
        confirmDelete: false,
      });
    } else {
      const newAlerts = this.props.alerts;
      const newAlert = new AlertType();
      newAlert.title = (
        <Trans>
          Cannot delete until collections <br />
          that depend on this collection <br />
          have been deleted.
        </Trans>
      );
      newAlert.variant = 'warning';
      newAlerts.push(newAlert);
      this.props.setAlerts({ alerts: newAlerts });
    }
  }

  private deleteCollection = () => {
    const {
      deleteCollection,
      deleteCollection: { name },
      collectionVersion,
    } = this.state;

    CollectionAPI.deleteCollection(
      this.props.context.selectedRepo,
      deleteCollection,
    )
      .then((res) => {
        const taskId = getIdFromTask(res.data.task);

        waitForTask(taskId).then(() => {
          this.props.context.setAlerts([
            ...this.props.context.alerts,
            {
              variant: 'success',
              title: (
                <Trans>
                  Collection &quot;{name} v{collectionVersion}
                  &quot; has been successfully deleted.
                </Trans>
              ),
            },
          ]);
          this.setState({
            collectionVersion: null,
            deleteCollection: null,
            isDeletionPending: false,
          });
          this.props.reload();
        });
      })
      .catch((err) => {
        const { status, statusText } = err.response;
        this.setState({
          collectionVersion: null,
          deleteCollection: null,
          isDeletionPending: false,
        });
        this.props.setAlerts({
          alerts: [
            ...this.props.alerts,
            {
              variant: 'danger',
              title: t`Collection "${name}" could not be deleted.`,
              description: errorMessage(status, statusText),
            },
          ],
        });
      });
  };
}
