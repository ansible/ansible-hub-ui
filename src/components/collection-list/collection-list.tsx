import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import './list.scss';

import { Button, DropdownItem, DataList } from '@patternfly/react-core';
import { CollectionListType } from 'src/api';

import {
  CollectionListItem,
  Pagination,
  StatefulDropdown,
  EmptyStateFilter,
  DeleteCollectionModal,
} from 'src/components';
import { ParamHelper } from 'src/utilities/param-helper';

import { deleteCollectionUtils } from 'src/utilities';

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
  addAlert: (alert) => void;
  reload: () => void;
  context: any;
}

interface IState {
  deleteCollection: CollectionListType;
  confirmDelete: boolean;
  isDeletionPending: boolean;
}

// only used in namespace detail, collections uses individual items
export class CollectionList extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      deleteCollection: null,
      confirmDelete: false,
      isDeletionPending: false,
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

    const { deleteCollection, isDeletionPending, confirmDelete } = this.state;

    return (
      <React.Fragment>
        <DeleteCollectionModal
          deleteCollection={deleteCollection}
          isDeletionPending={isDeletionPending}
          confirmDelete={confirmDelete}
          collectionVersion={null}
          cancelAction={() => this.setState({ deleteCollection: null })}
          deleteAction={() =>
            this.setState({ isDeletionPending: true }, () => {
              deleteCollectionUtils.deleteCollection(
                this,
                false,
                this.props.context.selectedRepo,
                (alert) => {
                  this.props.addAlert(alert);
                },
              );
            })
          }
          onChange={(val) => this.setState({ confirmDelete: val })}
        ></DeleteCollectionModal>
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
      (alerts) => this.props.addAlert(alerts),
    );
  }

  private openDeleteModalWithConfirm(noDependencies, collection) {
    if (noDependencies) {
      this.setState({
        deleteCollection: collection,
        confirmDelete: false,
      });
    } else {
      this.props.addAlert({
        title: (
          <Trans>
            Cannot delete until collections <br />
            that depend on this collection <br />
            have been deleted.
          </Trans>
        ),
        variant: 'warning',
      });
    }
  }

  public load() {
    this.props.reload();
  }
}
