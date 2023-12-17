import { Trans, t } from '@lingui/macro';
import { ActionGroup, Button } from '@patternfly/react-core';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LegacyImportAPI } from 'src/api';
import { AlertType, DataForm, ExternalLink } from 'src/components';
import { useContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import { ErrorMessagesType, handleHttpError, taskAlert } from 'src/utilities';

interface IProps {
  addAlert: (alert: AlertType) => void;
}

export const RoleImportForm = ({ addAlert }: IProps) => {
  const { queueAlert, user } = useContext();
  const [data, setData] = useState<{
    alternate_role_name?: string;
    github_repo?: string;
    github_user?: string;
    namespace_id?: string;
  }>(user.is_superuser ? {} : { github_user: user.username });
  const [errors, setErrors] = useState<ErrorMessagesType>(null);
  const navigate = useNavigate();

  // TODO user will have their namespace, superuser needs to create+assign
  const formFields = [
    { id: 'github_user', title: t`GitHub user` },
    {
      id: 'github_repo',
      title: t`GitHub repository`,
      helper:
        !data.github_repo ||
        data.github_repo.startsWith('ansible-role-') ||
        'ansible-role-'.startsWith(data.github_repo)
          ? null
          : {
              variant: 'warning' as const,
              text: (
                <>
                  {t`Did you mean ${`ansible-role-${data.github_repo}`}?`}{' '}
                  <Button
                    variant='link'
                    onClick={() =>
                      updateField(
                        'github_repo',
                        `ansible-role-${data.github_repo}`,
                      )
                    }
                  >{t`Change`}</Button>
                </>
              ),
            },
    },
    {
      id: 'github_reference',
      title: t`GitHub ref (a commit, branch or tag)`,
      placeholder: t`Automatic`,
    },
    {
      id: 'alternate_role_name',
      title: t`Role name`,
      placeholder: t`Only used when a role doesn't have galaxy_info.role_name metadata, and doesn't follow the ansible-role-$name naming convention.`,
    },
  ];

  const requiredFields = ['github_user', 'github_repo'];

  const nonempty = (o) =>
    Object.fromEntries(Object.entries(o).filter(([_k, v]) => v));

  const onCancel = () => navigate(formatPath(Paths.standaloneRoles));
  const onSaved = ({
    data: {
      results: [{ pulp_id }],
    },
  }) => {
    // the role import_log tab is not available before the role gets imported, go to list
    // TODO .. but we could waitForTask, and go to role on success
    queueAlert(taskAlert(pulp_id, t`Import started`));
    navigate(formatPath(Paths.standaloneRoles));
  };

  const onSave = () =>
    LegacyImportAPI.import(nonempty(data))
      .then(onSaved)
      .catch(handleHttpError(t`Failed to import role`, null, addAlert));

  const link =
    data.github_user &&
    data.github_repo &&
    `https://github.com/${data.github_user}/${data.github_repo}`;

  const anyErrors = !!errors || requiredFields.some((k) => !data[k]);

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
    setData((data) => ({ ...data, [k]: v }));

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
      updateField={(v, e) => updateField(e.target.id, v)}
      onSave={onSave}
    />
  );
};
