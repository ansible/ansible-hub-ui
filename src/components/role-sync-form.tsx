import { Trans, t } from '@lingui/macro';
import { ActionGroup, Button } from '@patternfly/react-core';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LegacySyncAPI } from 'src/api';
import { AlertType, DataForm, ExternalLink } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { ErrorMessagesType, handleHttpError, taskAlert } from 'src/utilities';

interface IProps {
  addAlert: (alert: AlertType) => void;
}

export const RoleSyncForm = ({ addAlert }: IProps) => {
  const [data, setData] = useState<{
    github_user: string;
    role_name: string;
  }>({ github_user: '', role_name: '' });
  const [errors, setErrors] = useState<ErrorMessagesType>(null);
  const navigate = useNavigate();

  const formFields = [
    { id: 'github_user', title: t`GitHub user` },
    { id: 'role_name', title: t`Role name` },
  ];

  const requiredFields = ['github_user', 'role_name'];

  const onCancel = () => navigate(formatPath(Paths.standaloneRoles));

  const onSaved = ({ data: { pulp_id } }) =>
    addAlert(taskAlert(pulp_id, t`Sync started`));

  const onSave = () =>
    LegacySyncAPI.sync(data)
      .then(onSaved)
      .catch(handleHttpError(t`Failed to sync role`, null, addAlert));

  const link =
    data.github_user &&
    data.role_name &&
    `https://galaxy.ansible.com/ui/standalone/roles/${data.github_user}/${data.role_name}/`;

  const anyErrors =
    !!Object.keys(errors || {}).length || requiredFields.some((k) => !data[k]);

  const formSuffix = (
    <>
      {link ? (
        <div>
          <Trans>
            Will sync <ExternalLink href={link}>{link}</ExternalLink>
          </Trans>
        </div>
      ) : null}
      <ActionGroup key='actions'>
        <Button type='submit' isDisabled={anyErrors}>
          {t`Sync`}
        </Button>
        <Button onClick={onCancel} variant='link'>
          {t`Cancel`}
        </Button>
      </ActionGroup>
    </>
  );

  const updateField = (k, v) => {
    if (k === 'github_user' && v.includes('.')) {
      const [github_user, role_name] = v.split('.');
      setData((data) => ({
        ...data,
        github_user,
        role_name,
      }));
    } else {
      setData((data) => ({ ...data, [k]: v }));
    }

    setErrors((errors) => {
      const e = { ...errors };
      delete e[k];
      if (k === 'github_user' && v.includes('.')) {
        delete e.role_name;
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
