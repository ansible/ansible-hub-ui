import React from 'react';
import { AppContext } from 'src/loaders/app-context';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { BaseHeader, Main } from 'src/components';
import { t } from '@lingui/macro';

interface IState {
  role: '';
}

export class RoleDetail extends React.Component<RouteComponentProps, IState> {
  render() {
    return (
      <>
        <BaseHeader title={t`Role Detail`}></BaseHeader>
        <Main></Main>
      </>
    );
  }
}

export default withRouter(RoleDetail);
RoleDetail.contextType = AppContext;
