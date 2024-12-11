import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { List, ListItem } from '@patternfly/react-core';
import React from 'react';
import { type UserType } from 'src/api';
import { Alert, DeleteModal, Spinner } from 'src/components';

interface IProps {
  canViewUsers?: boolean;
  cancelAction: () => void;
  count?: number;
  deleteAction: () => void;
  name: string;
  users?: UserType[];
}

export const DeleteGroupModal = ({
  canViewUsers,
  cancelAction,
  count,
  deleteAction,
  name,
  users,
}: IProps) => (
  <DeleteModal
    cancelAction={cancelAction}
    deleteAction={deleteAction}
    title={t`Delete group?`}
  >
    <Trans>
      <b>{name}</b> will be permanently deleted.
    </Trans>
    <p>&nbsp;</p>
    <div>
      {users && count > 10 && (
        <p>
          <Trans>Deleting this group will affect {count} users.</Trans>
        </p>
      )}
      {users && count > 0 && count <= 10 && (
        <>
          <p>
            <Trans>These users will lose access to the group content:</Trans>
          </p>
          <List>
            {users.map((u) => (
              <ListItem key={u.username}>
                <b>{u.username}</b>
              </ListItem>
            ))}
          </List>
        </>
      )}

      {canViewUsers ? (
        <>
          {users && !count && <p>{t`No users will be affected.`}</p>}
          {!users && (
            <p>
              <Trans>
                Checking for affected users... <Spinner size='sm' />
              </Trans>
            </p>
          )}
        </>
      ) : (
        <Alert
          title={t`This group can include users`}
          variant='warning'
          isInline
        >
          <Trans>You don&apos;t have permission to display users.</Trans>
        </Alert>
      )}
    </div>
  </DeleteModal>
);
