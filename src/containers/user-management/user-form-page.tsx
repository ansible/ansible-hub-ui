import * as React from 'react';

import {
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  Button,
  DropdownItem,
  EmptyState,
  EmptyStateIcon,
  Title,
  EmptyStateBody,
  EmptyStateVariant,
} from '@patternfly/react-core';

import { Section } from '@redhat-cloud-services/frontend-components';

import { BaseHeader, Main, Breadcrumbs, UserForm } from '../../components';
import { UserType } from '../../api';

interface IProps {
  title: string;
  user: UserType;
  breadcrumbs: any[];
  errorMessages: object;
  isReadonly?: boolean;

  updateUser: (user: UserType) => void;
  saveUser?: () => void;
  extraControls?: React.ReactNode;
  onCancel?: () => void;
}

export function mapErrorMessages(err) {
  const messages: any = {};
  for (const e of err.response.data.errors) {
    messages[e.source.parameter] = e.detail;
  }
  return messages;
}

export class UserFormPage extends React.Component<IProps> {
  public static defaultProps = {
    extraControls: null,
  };
  render() {
    const {
      user,
      breadcrumbs,
      title,
      updateUser,
      errorMessages,
      saveUser,
      isReadonly,
      extraControls,
      onCancel,
    } = this.props;

    return (
      <React.Fragment>
        <BaseHeader
          breadcrumbs={<Breadcrumbs links={breadcrumbs}></Breadcrumbs>}
          title={title}
        ></BaseHeader>
        <Main>
          <Section className='body'>
            {extraControls}
            <UserForm
              isReadonly={isReadonly}
              user={user}
              updateUser={updateUser}
              errorMessages={errorMessages}
              saveUser={saveUser}
              onCancel={onCancel}
            ></UserForm>
          </Section>
        </Main>
      </React.Fragment>
    );
  }
}
