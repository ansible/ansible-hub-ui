import * as React from 'react';

import { Section } from '@redhat-cloud-services/frontend-components';

import { BaseHeader, Main, Breadcrumbs, UserForm } from 'src/components';
import { UserType } from 'src/api';

interface IProps {
  title: string;
  user: UserType;
  breadcrumbs: any[];
  errorMessages: object;
  isReadonly?: boolean;

  updateUser: (user: UserType, errorMessages: object) => void;
  saveUser?: () => void;
  extraControls?: React.ReactNode;
  onCancel?: () => void;
  isNewUser?: boolean;
  isMe?: boolean;
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
      isNewUser,
      isMe,
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
              isMe={isMe}
              isReadonly={isReadonly}
              user={user}
              updateUser={updateUser}
              errorMessages={errorMessages}
              saveUser={saveUser}
              onCancel={onCancel}
              isNewUser={isNewUser}
            ></UserForm>
          </Section>
        </Main>
      </React.Fragment>
    );
  }
}
