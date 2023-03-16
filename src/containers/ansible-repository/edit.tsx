import { t } from '@lingui/macro';
import React from 'react';
import {
  AnsibleDistributionAPI,
  AnsibleRepositoryAPI,
  AnsibleRepositoryType,
} from 'src/api';
import { AnsibleRepositoryForm, Page } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { isLoggedIn } from 'src/permissions';
import { parsePulpIDFromURL } from 'src/utilities';

const initialRepository: AnsibleRepositoryType = {
  name: '',
  description: '',
  retain_repo_versions: 1,
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

  title: ({ name }) => name || t`Add new repository`,
  transformParams: ({ name, ...rest }) => ({
    ...rest,
    name: name !== '_' ? name : null,
  }),

  render: (item, { navigate, queueAlert, state, setState }) => {
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

    const saveRepository = ({
      createDistribution,
      createLabel,
      hideFromSearch,
      isPrivate,
      pipeline,
    }) => {
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
      // TODO update cant remove description, use ^
      // TODO default retain null, not 1

      if (item) {
        delete data.last_sync_task;
        delete data.last_synced_metadata_time;
        delete data.latest_version_href;
        delete data.pulp_created;
        delete data.pulp_href;
        delete data.versions_href;
      }

      data.pulp_labels ||= {};
      if (createLabel) {
        data.pulp_labels.content = 'approved_for_use';
      }
      if (hideFromSearch) {
        data.pulp_labels.hide_from_search = '';
      } else {
        delete data.pulp_labels.hide_from_search;
      }
      if (isPrivate) {
        data.pulp_labels.is_private = 'true';
      } else {
        delete data.pulp_labels.is_private;
      }
      if (pipeline) {
        data.pulp_labels.pipeline = pipeline;
      } else {
        delete data.pulp_labels.pipeline;
      }

      const promise = !item
        ? AnsibleRepositoryAPI.create(data)
        : AnsibleRepositoryAPI.update(parsePulpIDFromURL(item.pulp_href), data);

      promise
        .then(
          createDistribution
            ? ({ data: newData }) =>
                AnsibleDistributionAPI.create({
                  name: data.name,
                  base_path: data.name,
                  repository: newData.pulp_href,
                })
            : () => null,
        )
        .then(() => {
          setState({
            errorMessages: {},
            repositoryToEdit: undefined,
          });
          // TODO context addAlert, task variant on update?
          navigate(
            formatPath(Paths.ansibleRepositoryDetail, {
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
