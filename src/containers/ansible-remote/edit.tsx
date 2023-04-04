import { t } from '@lingui/macro';
import React from 'react';
import { AnsibleRemoteAPI, AnsibleRemoteType } from 'src/api';
import { Page, RemoteForm } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { canAddAnsibleRemote, canEditAnsibleRemote } from 'src/permissions';
import { parsePulpIDFromURL, taskAlert } from 'src/utilities';

const initialRemote: AnsibleRemoteType = {
  name: '',
  url: '',
  ca_cert: null,
  client_cert: null,
  tls_validation: true,
  proxy_url: null,
  download_concurrency: null,
  rate_limit: null,
  requirements_file: null,
  auth_url: null,
  signed_only: false,

  hidden_fields: [
    'client_key',
    'proxy_username',
    'proxy_password',
    'username',
    'password',
    'token',
  ].map((name) => ({ name, is_set: false })),
};

const AnsibleRemoteEdit = Page<AnsibleRemoteType>({
  breadcrumbs: ({ name }) =>
    [
      { url: formatPath(Paths.ansibleRemotes), name: t`Remotes` },
      name && { url: formatPath(Paths.ansibleRemoteDetail, { name }), name },
      name ? { name: t`Edit` } : { name: t`Add` },
    ].filter(Boolean),

  condition: (context, item?) =>
    canAddAnsibleRemote(context) || canEditAnsibleRemote(context, item),
  displayName: 'AnsibleRemoteEdit',
  errorTitle: t`Remote could not be displayed.`,
  query: ({ name }) => {
    return AnsibleRemoteAPI.list({ name })
      .then(({ data: { results } }) => results[0])
      .then((remote) => {
        return AnsibleRemoteAPI.myPermissions(
          parsePulpIDFromURL(remote.pulp_href),
        )
          .then(({ data: { permissions } }) => permissions)
          .catch((e) => {
            console.error(e);
            return [];
          })
          .then((my_permissions) => ({ ...remote, my_permissions }));
      });
  },

  title: ({ name }) => name || t`Add new remote`,
  transformParams: ({ name, ...rest }) => ({
    ...rest,
    name: name !== '_' ? name : null,
  }),

  render: (item, { navigate, queueAlert, state, setState }) => {
    if (!state.remoteToEdit) {
      const remoteToEdit = {
        ...initialRemote,
        ...item,
      };
      setState({ remoteToEdit, errorMessages: {} });
    }

    const { remoteToEdit, errorMessages } = state;
    if (!remoteToEdit) {
      return null;
    }

    const saveRemote = () => {
      const { remoteToEdit } = state;

      const data = { ...remoteToEdit };

      if (!item) {
        // prevent "This field may not be blank." when writing in and then deleting username/password/etc
        // only when creating, edit diffs with item
        Object.keys(data).forEach((k) => {
          if (data[k] === '' || data[k] == null) {
            delete data[k];
          }
        });

        delete data.hidden_fields;
      }

      delete data.my_permissions;

      // api requires traling slash, fix the trivial case
      if (data.url && !data.url.includes('?') && !data.url.endsWith('/')) {
        data.url += '/';
      }

      const promise = !item
        ? AnsibleRemoteAPI.create(data)
        : AnsibleRemoteAPI.smartUpdate(
            parsePulpIDFromURL(item.pulp_href),
            data,
            item,
          );

      promise
        .then(({ data: task }) => {
          setState({
            errorMessages: {},
            remoteToEdit: undefined,
          });

          queueAlert(
            item
              ? taskAlert(task, t`Update started for remote ${data.name}`)
              : {
                  variant: 'success',
                  title: t`Successfully created remote ${data.name}`,
                },
          );

          navigate(
            formatPath(Paths.ansibleRemoteDetail, {
              name: data.name,
            }),
          );
        })
        .catch(({ response: { data } }) =>
          setState({
            errorMessages: {
              __nofield: data.non_field_errors || data.detail,
              ...data,
            },
          }),
        );
    };

    const closeModal = () => {
      setState({ errorMessages: {}, remoteToEdit: undefined });
      navigate(
        item
          ? formatPath(Paths.ansibleRemoteDetail, {
              name: item.name,
            })
          : formatPath(Paths.ansibleRemotes),
      );
    };

    return (
      <RemoteForm
        allowEditName={!item}
        remote={remoteToEdit}
        updateRemote={(r) => setState({ remoteToEdit: r })}
        remoteType='ansible-remote'
        showMain={true}
        saveRemote={saveRemote}
        errorMessages={errorMessages}
        closeModal={closeModal}
      />
    );
  },
});

export default AnsibleRemoteEdit;
