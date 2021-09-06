import * as React from 'react';
import { t, Trans } from '@lingui/macro';

import { DeleteModal } from '../../components/delete-modal/delete-modal';
import { Checkbox, Text } from '@patternfly/react-core';

import { CollectionDetailType, NamespaceAPI, NamespaceType } from 'src/api';
import { AlertType } from 'src/components';

interface IProps {
  isOpen: boolean;
  closeModal: () => void;
  collection?: CollectionDetailType;
  collectionVersion?: string | null;
  namespace?: NamespaceType;
  addAlert?: (props: AlertType) => void;
}

interface IState {
  confirmDelete: boolean;
}
/**
 * Modal for deleting namespaces and collections
 */
export class DeleteCollectionModal extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      confirmDelete: false,
    };
  }

  render() {
    const { isOpen, collection, closeModal, collectionVersion, namespace } =
      this.props;

    if (!isOpen) return null;

    return (
      <DeleteModal
        isDisabled={!this.state.confirmDelete}
        cancelAction={() => {
          this.setState({ confirmDelete: false });
          closeModal();
        }}
        deleteAction={() =>
          namespace
            ? this.deleteNamespace(namespace)
            : this.deleteCollection(collection)
        }
        title={
          namespace
            ? t`Permanently delete namespace?`
            : t`Permanently delete collection${
                collectionVersion ? ' version' : ''
              }?`
        }
      >
        <Text style={{ paddingBottom: 'var(--pf-global--spacer--md)' }}>
          {namespace ? (
            <Trans>
              Deleting <b>{namespace.name}</b> and its data will be lost.
            </Trans>
          ) : (
            <>
              {!collectionVersion ? (
                <Trans>
                  Deleting <b>{collection.name}</b> and its data will be lost.
                </Trans>
              ) : collection.all_versions.length > 1 ? (
                <Trans>
                  Deleting{' '}
                  <b>
                    {collection.name}{' '}
                    {collectionVersion && <>v{collectionVersion}</>}
                  </b>{' '}
                  and its data will be lost.
                </Trans>
              ) : (
                <Trans>
                  Deleting{' '}
                  <b>
                    {collection.name}{' '}
                    {collectionVersion && <>v{collectionVersion}</>}
                  </b>{' '}
                  and its data will be lost and this will cause the entire
                  collection to be deleted.
                </Trans>
              )}
            </>
          )}
        </Text>
        <Checkbox
          isChecked={this.state.confirmDelete}
          onChange={(val) => this.setState({ confirmDelete: val })}
          label={t`I understand that this action cannot be undone.`}
          id='delete_confirm'
        />
      </DeleteModal>
    );
  }

  private deleteCollection(collection) {
    console.log('on collection delete');
  }

  private deleteNamespace({ name }) {
    NamespaceAPI.removeNamespace(name)
      .then(() => {
        this.props.addAlert({
          variant: 'success',
          title: t`Successfully deleted namespace.`,
        });
      })
      .catch((e) => {
        this.props.addAlert({
          variant: 'danger',
          title: t`Error deleting namespace.`,
          description: e.message,
        });
        this.setState({ confirmDelete: false });
      });
  }
}
