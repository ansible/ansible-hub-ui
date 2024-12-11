import { t } from '@lingui/macro';
import { Button, Label, Modal } from '@patternfly/react-core';
import { Table, Td } from '@patternfly/react-table';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  LegacyNamespaceAPI,
  type LegacyNamespaceListType,
  NamespaceAPI,
} from 'src/api';
import {
  EmptyStateFilter,
  EmptyStateNoData,
  HubListToolbar,
  LoadingSpinner,
  RadioRow,
  SortTable,
} from 'src/components';
import { filterIsSet, handleHttpError, roleNamespaceInfo } from 'src/utilities';

interface IProps {
  addAlert: (alert) => void;
  closeAction: () => void;
  namespace: LegacyNamespaceListType;
}

export const RoleNamespaceEditModal = ({
  addAlert,
  closeAction,
  namespace,
}: IProps) => {
  const finishAction = () =>
    LegacyNamespaceAPI.changeProvider(namespace.id, selected.id)
      .then(() => {
        closeAction();

        addAlert({
          title: t`Successfully changed provider namespace.`,
          variant: 'success',
        });
      })
      .catch(
        handleHttpError(
          t`Failed to change provider namespace.`,
          closeAction,
          addAlert,
        ),
      );

  const provider = roleNamespaceInfo(namespace);

  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<{ keywords?: string }>({});
  const [selected, setSelected] = useState(null);

  const actions = [
    <Button
      key='submit'
      onClick={() => finishAction()}
      isDisabled={!selected}
      variant='primary'
    >
      {t`Save`}
    </Button>,
    <Button key='close' onClick={() => closeAction()} variant='link'>
      {t`Cancel`}
    </Button>,
  ];

  useEffect(() => {
    setLoading(true);
    NamespaceAPI.list({ keywords: params.keywords || '', sort: 'name' }).then(
      ({
        data: {
          data,
          meta: { count },
        },
      }) => {
        setCount(count);
        setItems(data);
        setLoading(false);
      },
    );
  }, [params.keywords]);

  return (
    <Modal
      actions={actions}
      isOpen
      onClose={closeAction}
      title={t`Change provider namespace`}
      variant='large'
    >
      {t`Role namespace`}: <b>{namespace.name}</b>
      <br />
      {t`Current provider namespace`}:{' '}
      {provider.url ? (
        <Link to={provider.url}>{provider.name}</Link>
      ) : (
        <>{t`None`}</>
      )}
      <br />
      {t`Selected provider namespace`}:{' '}
      {selected ? <Label>{selected.name}</Label> : <>{t`None`}</>}
      <br />
      <HubListToolbar
        count={count}
        filterConfig={[{ id: 'keywords', title: t`keywords` }]}
        ignoredParams={['page', 'page_size', 'sort']}
        params={params}
        updateParams={(newParams) => setParams(newParams)}
      />
      {loading ? (
        <LoadingSpinner />
      ) : !count ? (
        filterIsSet(params, ['keywords']) ? (
          <EmptyStateFilter />
        ) : (
          <EmptyStateNoData
            title={t`No namespaces found`}
            description={t`Namespaces will appear once created`}
          />
        )
      ) : (
        <Table aria-label={t`Namespace list`}>
          <SortTable
            params={{ sort: 'name' }}
            updateParams={() => null}
            options={{
              headers: [
                { title: '', type: 'none', id: 'radio' },
                { title: t`Name`, type: 'none', id: 'name' },
                { title: t`Description`, type: 'none', id: 'description' },
                { title: t`Access`, type: 'none', id: 'owners' },
              ],
            }}
          />
          {items.map(({ id, name, description, groups, users }) => (
            <RadioRow
              rowIndex={id}
              key={id}
              isSelected={selected?.name === name}
              onSelect={() => setSelected({ id, name })}
              isDisabled={provider?.name === name}
            >
              <Td>{name}</Td>
              <Td>{description}</Td>
              <Td>
                {users.length ? (
                  <>
                    <b>{t`Users`}</b>:{' '}
                    {users.map(({ name }) => name).join(', ')}
                  </>
                ) : null}
                {users.length && groups.length ? <br /> : null}
                {groups.length ? (
                  <>
                    <b>{t`Groups`}</b>:{' '}
                    {groups.map(({ name }) => name).join(', ')}
                  </>
                ) : null}
              </Td>
            </RadioRow>
          ))}
        </Table>
      )}
    </Modal>
  );
};
