import { Trans, t } from '@lingui/macro';
import { DropdownItem } from '@patternfly/react-core';
import React, { Fragment } from 'react';
import { StatefulDropdown, Tooltip } from 'src/components';
import { useContext } from 'src/loaders/app-context';

interface IProps {
  collection;
  deletionBlocked?: boolean;
  namespace;
  onCopyVersion?;
  onDelete?;
  onDeleteVersion?;
  onDeprecate?;
  onRemove?;
  onRemoveVersion?;
  onSign?;
  onSignVersion?;
  onUploadVersion?;
  version?: string;
  wrapper?;
}

export const CollectionDropdown = ({
  collection,
  deletionBlocked,
  namespace,
  onCopyVersion,
  onDelete,
  onDeleteVersion,
  onDeprecate,
  onRemove,
  onRemoveVersion,
  onSign,
  onSignVersion,
  onUploadVersion,
  version,
  wrapper: Wrapper = Fragment,
}: IProps) => {
  const {
    featureFlags: {
      can_create_signatures,
      can_upload_signatures,
      display_repositories,
      display_signatures,
    },
    hasPermission,
    user: { is_superuser },
  } = useContext();

  const hasObjectPermission = (permission) =>
    namespace?.related_fields?.my_permissions?.includes?.(permission);

  const hasPerm = (permission) =>
    hasPermission(permission) ||
    hasObjectPermission(permission) ||
    is_superuser;

  const canCopy = display_repositories;
  const canDelete =
    hasPerm('ansible.delete_collection') || hasPerm('galaxy.change_namespace');
  const canDeprecate = hasPerm('galaxy.change_namespace');
  const canSign =
    can_create_signatures &&
    hasPerm('galaxy.change_namespace') &&
    hasPerm('galaxy.upload_to_namespace');
  const canUpload = hasPerm('galaxy.upload_to_namespace');

  const DeleteWrapper = ({
    caption,
    'data-cy': dataCy,
    onClick,
  }: {
    caption: string;
    'data-cy'?: string;
    onClick;
  }) =>
    deletionBlocked ? (
      <Tooltip
        position='left'
        content={
          <Trans>
            Cannot delete until collections <br />
            that depend on this collection <br />
            have been deleted.
          </Trans>
        }
      >
        <DropdownItem isDisabled>{caption}</DropdownItem>
      </Tooltip>
    ) : (
      <DropdownItem data-cy={dataCy} onClick={onClick}>
        {caption}
      </DropdownItem>
    );

  const dropdownItems = [
    canDelete && (
      <DeleteWrapper
        caption={t`Delete collection from system`}
        data-cy='delete-collection'
        key='delete-collection'
        onClick={onDelete}
      />
    ),
    canDelete && display_repositories && (
      <DeleteWrapper
        caption={t`Remove collection from repository`}
        key='remove-collection'
        onClick={onRemove}
      />
    ),
    canDelete && (
      <DropdownItem
        data-cy='delete-collection-version'
        key='delete-collection-version'
        onClick={onDeleteVersion}
      >
        {t`Delete version ${version} from system`}
      </DropdownItem>
    ),
    canDelete && display_repositories && (
      <DropdownItem key='remove-collection-version' onClick={onRemoveVersion}>
        {t`Remove version ${version} from repository`}
      </DropdownItem>
    ),
    canSign && !can_upload_signatures && (
      <DropdownItem key='sign-collection' onClick={onSign}>
        {t`Sign collection`}
      </DropdownItem>
    ),
    canSign && (
      <DropdownItem key='sign-collection-version' onClick={onSignVersion}>
        {t`Sign version ${version}`}
      </DropdownItem>
    ),
    canDeprecate && (
      <DropdownItem onClick={onDeprecate} key='deprecate-collection'>
        {collection.is_deprecated ? t`Undeprecate` : t`Deprecate`}
      </DropdownItem>
    ),
    canUpload && (
      <DropdownItem key='upload-collection-version' onClick={onUploadVersion}>
        {t`Upload new version`}
      </DropdownItem>
    ),
    canCopy && (
      <DropdownItem
        key='copy-collection-version-to-repository-dropdown'
        onClick={onCopyVersion}
        data-cy='copy-collection-version-to-repository-dropdown'
      >
        {t`Copy version ${version} to repositories`}
      </DropdownItem>
    ),
  ].filter(Boolean);

  return dropdownItems.length ? (
    <Wrapper>
      <StatefulDropdown items={dropdownItems} />
    </Wrapper>
  ) : null;
};
