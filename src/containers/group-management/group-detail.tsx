import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Section } from '@redhat-cloud-services/frontend-components';

import {
  BaseHeader,
  Breadcrumbs,
  LoadingPageWithHeader,
  Main,
  PartnerHeader,
  Tabs,
} from '../../components';
import { GroupAPI, UserAPI } from '../../api';
import { ParamHelper } from '../../utilities';
import { Paths } from '../../paths';

interface IState {
  group: any;
  params: { id: string; tab: string };
}

class GroupDetail extends React.Component<RouteComponentProps, IState> {
  nonQueryStringParams = ['group'];

  constructor(props) {
    super(props);

    const id = this.props.match.params['group'];
    this.state = {
      group: null,
      params: { id: id, tab: 'permissions' },
    };
  }

  componentDidMount() {
    GroupAPI.get(this.state.params.id).then(result => {
      this.setState({ group: result.data });
    });
  }

  render() {
    const { group, params } = this.state;

    const tabs = ['Permissions', 'Users'];

    if (!group) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }
    return (
      <React.Fragment>
        <BaseHeader
          title={group.name}
          breadcrumbs={
            <Breadcrumbs
              links={[
                { url: Paths.groupList, name: 'Groups' },
                { name: group.name },
              ]}
            />
          }
          pageControls={null}
        >
          <div className='tab-link-container'>
            <div className='tabs'>
              <Tabs
                tabs={tabs}
                params={params}
                updateParams={p => this.updateParams(p)}
              />
            </div>
          </div>
        </BaseHeader>
        <Main>
          <Section className='body'>
            <h1>{group.name}</h1>
          </Section>
        </Main>
      </React.Fragment>
    );
  }
  private get updateParams() {
    return ParamHelper.updateParamsMixin(this.nonQueryStringParams);
  }
  private renderPageControls() {
    return null;
  }
}

export default withRouter(GroupDetail);
