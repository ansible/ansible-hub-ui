import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import {
  ActionGroup,
  Button,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LegacyImportAPI, LegacyNamespaceAPI } from 'src/api';
import {
  type AlertType,
  DataForm,
  ExternalLink,
  RoleNamespaceEditModal,
} from 'src/components';
import { useHubContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import {
  type ErrorMessagesType,
  ParamHelper,
  handleHttpError,
  taskAlert,
} from 'src/utilities';

interface IProps {
  addAlert: (alert: AlertType) => void;
}

const NamespaceCheck = ({
  addAlert,
  is_superuser,
  user,
}: {
  addAlert: IProps['addAlert'];
  is_superuser: boolean;
  user: string;
}) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [namespace, setNamespace] = useState(null);
  const [providerModal, setProviderModal] = useState(false);

  const recheck = () => {
    setError(null);
    setNamespace(null);

    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    LegacyNamespaceAPI.list({
      name: user,
      page_size: 1,
    })
      .then(
        ({
          data: {
            results: [first],
          },
        }) => setNamespace(first),
      )
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(recheck, [user]);

  useEffect(() => {
    if (providerModal === null) {
      recheck();
      setProviderModal(false);
    }
  }, [providerModal]);

  const provider = namespace?.summary_fields?.provider_namespaces?.[0];

  return user ? (
    <>
      {providerModal && namespace && (
        <RoleNamespaceEditModal
          addAlert={addAlert}
          closeAction={() => setProviderModal(null)}
          namespace={namespace}
        />
      )}
      <HelperText>
        {loading ? (
          <HelperTextItem variant='indeterminate'>{t`Checking ...`}</HelperTextItem>
        ) : null}
        {namespace && provider ? (
          <HelperTextItem variant='success'>
            {t`Found`} (
            <Trans>
              <Link
                to={formatPath(Paths.standaloneNamespace, {
                  namespaceid: namespace.id,
                })}
              >
                {namespace.name}
              </Link>
              , provided by{' '}
              <Link
                to={formatPath(Paths.namespaceDetail, {
                  namespace: provider.name,
                })}
              >
                {provider.name}
              </Link>
            </Trans>
            )
          </HelperTextItem>
        ) : null}
        {error ? (
          <HelperTextItem variant='warning'>
            {t`Failed`}: {error?.message || error}
          </HelperTextItem>
        ) : null}
        {!namespace && !loading && !error ? (
          <HelperTextItem variant='error'>
            {t`No matching namespace found`}
            {is_superuser ? ' ' : null}
            {is_superuser ? (
              <Button
                variant='link'
                onClick={() => {
                  LegacyNamespaceAPI.create({ name: user })
                    .then(() => {
                      addAlert({
                        variant: 'success',
                        title: t`Successfully created role namespace ${user}`,
                      });
                      recheck();
                    })
                    .catch(
                      handleHttpError(
                        t`Failed to create role namespace`,
                        () => null,
                        addAlert,
                      ),
                    );
                }}
              >{t`Create`}</Button>
            ) : null}
          </HelperTextItem>
        ) : null}
        {namespace && !provider && !loading && !error ? (
          <HelperTextItem variant='error'>
            <Trans>
              Found a standalone namespace (
              <Link
                to={formatPath(Paths.standaloneNamespace, {
                  namespaceid: namespace.id,
                })}
              >
                {namespace.name}
              </Link>
              ), but NOT a provider namespace.
            </Trans>
            {is_superuser ? ' ' : null}
            {is_superuser ? (
              <Button
                variant='link'
                onClick={() => setProviderModal(true)}
              >{t`Change provider namespace`}</Button>
            ) : null}
          </HelperTextItem>
        ) : null}
      </HelperText>
    </>
  ) : null;
};

export const RoleImportForm = ({ addAlert }: IProps) => {
  const { queueAlert, user } = useHubContext();
  const navigate = useNavigate();
  const location = useLocation();
  const params = ParamHelper.parseParamString(location.search) as {
    github_branch?: string;
    github_repo?: string;
    github_user?: string;
    back?: string;
  };
  const [data, setData] = useState<{
    alternate_namespace_name?: string;
    alternate_role_name?: string;
    github_reference?: string;
    github_repo?: string;
    github_user?: string;
  }>({
    alternate_namespace_name: '',
    alternate_role_name: '',
    github_reference: params.github_branch || '',
    github_repo: params.github_repo || '',
    github_user:
      params.github_user || (user.is_superuser ? '' : user.username) || '',
  });
  const [errors, setErrors] = useState<ErrorMessagesType>(null);

  const formFields = [
    {
      id: 'github_user',
      title: t`GitHub user`,
      helper: (
        <NamespaceCheck
          addAlert={addAlert}
          is_superuser={user.is_superuser}
          user={data.github_user}
        />
      ),
    },
    {
      id: 'github_repo',
      title: t`GitHub repository`,
      helper:
        !data.github_repo ||
        data.github_repo.startsWith('ansible-role-') ||
        'ansible-role-'.startsWith(data.github_repo) ? null : (
          <HelperText>
            <HelperTextItem variant='warning'>
              {t`Did you mean ${`ansible-role-${data.github_repo}`}?`}{' '}
              <Button
                variant='link'
                onClick={() =>
                  updateField('github_repo', `ansible-role-${data.github_repo}`)
                }
              >{t`Change`}</Button>
            </HelperTextItem>
          </HelperText>
        ),
    },
    {
      id: 'github_reference',
      title: t`GitHub ref (a commit, branch or tag)`,
      placeholder: t`Automatic`,
    },
    {
      id: 'alternate_namespace_name',
      title: t`Namespace name`,
      placeholder: t`Overrides any galaxy_info.namespace metadata`,
    },
    {
      id: 'alternate_role_name',
      title: t`Role name`,
      placeholder: t`Overrides any galaxy_info.role_name metadata`,
    },
  ];

  const requiredFields = ['github_user', 'github_repo'];

  const nonempty = (o) =>
    Object.fromEntries(Object.entries(o).filter(([_k, v]) => v));

  const onCancel = () =>
    navigate(params.back || formatPath(Paths.standaloneRoles));

  const onSaved = ({
    data: {
      results: [{ pulp_id }],
    },
  }) => {
    // the role import_log tab is not available before the role gets imported, go to list
    // TODO waitForTask (needs galaxy_ng#2012) and go to my role imports to see the import
    queueAlert(taskAlert(pulp_id, t`Import started`));
    navigate(params.back || formatPath(Paths.standaloneRoles));
  };

  const onSave = () =>
    LegacyImportAPI.import(nonempty(data))
      .then(onSaved)
      .catch(handleHttpError(t`Failed to import role`, null, addAlert));

  const link =
    data.github_user &&
    data.github_repo &&
    `https://github.com/${data.github_user}/${data.github_repo}`;

  const anyErrors =
    !!Object.keys(errors || {}).length || requiredFields.some((k) => !data[k]);

  const formSuffix = (
    <>
      {link ? (
        <div>
          <Trans>
            Will clone <ExternalLink href={link}>{link}</ExternalLink>
          </Trans>
        </div>
      ) : null}
      <ActionGroup key='actions'>
        <Button type='submit' isDisabled={anyErrors}>
          {t`Import`}
        </Button>
        <Button onClick={onCancel} variant='link'>
          {t`Cancel`}
        </Button>
      </ActionGroup>
    </>
  );

  const updateField = (k, v) => {
    if (k === 'github_user' && v.includes('github.com/')) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_proto, _empty, _host, github_user, github_repo] = v.split('/');
      setData((data) => ({
        ...data,
        github_user,
        github_repo: github_repo.replace(/\.git$/, ''),
      }));
    } else if (k === 'github_user' && v.includes('/')) {
      const [github_user, github_repo] = v.split('/');
      setData((data) => ({
        ...data,
        github_user,
        github_repo,
      }));
    } else {
      setData((data) => ({ ...data, [k]: v }));
    }

    setErrors((errors) => {
      const e = { ...errors };
      delete e[k];
      if (k === 'github_user' && v.includes('/')) {
        delete e.github_repo;
      }
      return e;
    });

    if (requiredFields.includes(k) && !v) {
      setErrors((errors) => ({ ...errors, [k]: t`Field is required.` }));
    }
  };

  return (
    <DataForm
      errorMessages={errors || {}}
      formFields={formFields}
      formSuffix={formSuffix}
      model={data}
      requiredFields={requiredFields}
      updateField={(e, v) => updateField(e.target.id, v)}
      onSave={onSave}
    />
  );
};
