import { t } from '@lingui/macro';
import React from 'react';
import { AnsibleRemoteAPI, AnsibleRemoteType } from 'src/api';
import { Details, Page, RemoteForm } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { isLoggedIn } from 'src/permissions';

const wip = '🚧 ';

export const AnsibleRemoteEdit = Page<AnsibleRemoteType>({
  breadcrumbs: ({ name }) =>
    [
      { url: formatPath(Paths.ansibleRemotes), name: t`Remotes` },
      name && { url: formatPath(Paths.ansibleRemoteDetail, { name }), name },
      name ? { name: t`Edit` } : { name: t`Add` },
    ].filter(Boolean),
  condition: isLoggedIn,
  displayName: 'AnsibleRemoteEdit',
  errorTitle: t`Remote could not be displayed.`,
  query: ({ name }) =>
    AnsibleRemoteAPI.list({ name }).then(({ data: { results } }) => results[0]),
  title: ({ name }) => wip + (name || t`Add new remote`),
  transformParams: ({ name, ...rest }) => ({
    ...rest,
    name: name !== '_' ? name : null,
  }),
  render: (item, { query, state, setState }) => {
    if (!state.remoteToEdit) {
      const remoteToEdit = {
        name: '',
        url: '',
        write_only_fields: [
          { name: 'token', is_set: false },
          { name: 'password', is_set: false },
          { name: 'proxy_password', is_set: false },
          { name: 'client_key', is_set: false },
        ],
        ...item,
      };
      setState({ remoteToEdit, errorMessages: {} });
    }

    const { remoteToEdit, errorMessages } = state;
    if (!remoteToEdit) {
      return null;
    }

    return (
      <>
        <Details item={item} />

        <RemoteForm
          allowEditName={!item}
          remote={remoteToEdit}
          updateRemote={(r) => setState({ remoteToEdit: r })}
          remoteType='ansible-remote'
          showMain={true}
          saveRemote={() => {
            const { remoteToEdit } = state;
            console.log(remoteToEdit);

            try {
              const distro_path =
                remoteToEdit.repositories[0].distributions[0].base_path;

              console.log({
                distro_path,
                remoteToEdit,
              });
              //                .then(() => {
              //                  setState(
              //                    {
              //                      errorMessages: {},
              //                      remoteToEdit: undefined,
              //                    },
              //                    () => query(),
              //                  );
              //                })
              //                .catch((err) =>
              //                  setState({ errorMessages: mapErrorMessages(err) }),
              //                );
            } catch {
              setState({
                errorMessages: {
                  __nofield: t`Can't update remote without a distribution attached to it.`,
                },
              });
            }
          }}
          errorMessages={errorMessages}
          closeModal={() => setState({ errorMessages: {} })}
        />
        <Details item={remoteToEdit} />
      </>
    );
  },
});

export default AnsibleRemoteEdit;
