import { t } from '@lingui/macro';
import React from 'react';
import { AnsibleRepositoryAPI, AnsibleRepositoryType } from 'src/api';
import { AnsibleRepositoryForm, Page } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { isLoggedIn } from 'src/permissions';
import { parsePulpIDFromURL } from 'src/utilities';

const wip = '🚧 ';

const initialRepository: AnsibleRepositoryType = {
  name: '',
  description: '',
  retain_repo_versions: 0,
};

export const AnsibleRepositoryEdit = Page<AnsibleRepositoryType>({
  breadcrumbs: ({ name }) =>
    [
      { url: formatPath(Paths.ansibleRepositories), name: t`Repositories` },
      name && {
        url: formatPath(Paths.ansibleRepositoryDetail, { name }),
        name,
      },
      name ? { name: t`Edit` } : { name: t`Add` },
    ].filter(Boolean),

  condition: isLoggedIn,
  displayName: 'AnsibleRepositoryEdit',
  errorTitle: t`Repository could not be displayed.`,
  query: ({ name }) =>
    AnsibleRepositoryAPI.list({ name }).then(
      ({ data: { results } }) => results[0],
    ),

  title: ({ name }) => wip + (name || t`Add new repository`),
  transformParams: ({ name, ...rest }) => ({
    ...rest,
    name: name !== '_' ? name : null,
  }),

  render: (item, { navigate, state, setState }) => {
    if (!state.repositoryToEdit) {
      const repositoryToEdit = {
        ...initialRepository,
        ...item,
      };
      setState({ repositoryToEdit, errorMessages: {} });
    }

    const { repositoryToEdit, errorMessages } = state;
    if (!repositoryToEdit) {
      return null;
    }

    const saveRepository = () => {
      const { repositoryToEdit } = state;

      const data = { ...repositoryToEdit };

      if (!item) {
        // prevent "This field may not be blank." when writing in and then deleting username/password/etc
        // only when creating, edit diffs with item
        Object.keys(data).forEach((k) => {
          if (data[k] === '' || data[k] == null) {
            delete data[k];
          }
        });
      }

      const promise = !item
        ? AnsibleRepositoryAPI.create(data)
        : AnsibleRepositoryAPI.update(parsePulpIDFromURL(item.pulp_href), data);

      promise
        .then(() => {
          setState({
            errorMessages: {},
            repositoryToEdit: undefined,
          });
          // TODO context addAlert, task variant on update
          navigate(
            formatPath(Paths.ansibleRepositoryDetail, {
              name: data.name,
            }),
          );
        })
        .catch(({ response: { data } }) =>
          setState({
            errorMessages: { __nofield: data.non_field_errors, ...data },
          }),
        );
    };

    const closeModal = () => {
      setState({ errorMessages: {}, repositoryToEdit: undefined });
      navigate(
        item
          ? formatPath(Paths.ansibleRepositoryDetail, {
              name: item.name,
            })
          : formatPath(Paths.ansibleRepositories),
      );
    };

    return (
      <AnsibleRepositoryForm
        allowEditName={!item}
        errorMessages={errorMessages}
        onCancel={closeModal}
        onSave={saveRepository}
        repository={repositoryToEdit}
        updateRepository={(r) => setState({ repositoryToEdit: r })}
      />
    );
  },
});

export default AnsibleRepositoryEdit;
