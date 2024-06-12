import React from 'react';
import { type UserType } from 'src/api';
import {
  BaseHeader,
  type BreadcrumbType,
  Breadcrumbs,
  Main,
  UserForm,
} from 'src/components';
import { type ErrorMessagesType } from 'src/utilities';

interface IProps {
  title: string;
  user: UserType;
  breadcrumbs: BreadcrumbType[];
  errorMessages: ErrorMessagesType;
  isReadonly?: boolean;

  updateUser: (user: UserType, errorMessages: ErrorMessagesType) => void;
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
          breadcrumbs={<Breadcrumbs links={breadcrumbs} />}
          pageControls={extraControls}
          title={title}
        />
        <Main>
          <section className='body'>
            <UserForm
              isMe={isMe}
              isReadonly={isReadonly}
              user={user}
              updateUser={updateUser}
              errorMessages={errorMessages}
              saveUser={saveUser}
              onCancel={onCancel}
              isNewUser={isNewUser}
            />
          </section>
        </Main>
      </React.Fragment>
    );
  }
}
