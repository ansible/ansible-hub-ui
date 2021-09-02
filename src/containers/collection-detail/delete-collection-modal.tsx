import * as React from 'react';
import { t, Trans } from '@lingui/macro';

import { DeleteModal } from '../../components/delete-modal/delete-modal';
import { Checkbox, Text } from '@patternfly/react-core';

import { CollectionDetailType } from 'src/api';

interface IProps {
  isOpen: boolean;
  closeModal: () => void;
  collection: CollectionDetailType;
  collectionVersion: string | null;
}

interface IState {
  confirmDelete: boolean;
}

export class DeleteCollectionModal extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      confirmDelete: false,
    };
  }

  render() {
    const { isOpen, collection, closeModal, collectionVersion } = this.props;

    if (!isOpen) return null;

    const numOfCollections = collection.all_versions.length;
    //const dependencies = true;

    return (
      <DeleteModal
        isDisabled={!this.state.confirmDelete}
        cancelAction={closeModal}
        deleteAction={() => this.deleteCollection()}
        title={t`Permanently delete collection${
          collectionVersion ? ' version' : ''
        }?`}
      >
        <Text style={{ paddingBottom: 'var(--pf-global--spacer--md)' }}>
          <Trans>
            {!collectionVersion
              ? t`Deleting <b>${collection.name}</b> and its data will be lost.`
              : numOfCollections > 1
              ? t`Deleting <b>${collection.name} ${
                  collectionVersion ? `v${collectionVersion}` : ''
                }</b> and its data will be lost`
              : t`Deleting <b>${collection.name} ${
                  collectionVersion ? `v${collectionVersion}` : ''
                }</b> and its data will be lost and this will 
                  cause the entire collection to be deleted.`}
          </Trans>
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

  private deleteCollection() {}
}
