import * as React from 'react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';
import {
  BaseHeader,
  Breadcrumbs,
  Main,
  SortTable,
  Tabs,
  EmptyStateNoData,
} from '../../components';
import { Section } from '@redhat-cloud-services/frontend-components';
import { truncateSha } from '../../utilities';
import { FlexItem, Flex, Tooltip, Label } from '@patternfly/react-core';
import { formatPath, Paths } from '../../paths';
import { ActivitiesAPI } from '../../api';
import * as moment from 'moment';
import './execution-environment-detail.scss';
import { TagIcon } from '@patternfly/react-icons';

interface IState {
  loading: boolean;
  container: { name: string };
  activities: any[];
  redirect: string;
}

class ExecutionEnvironmentDetailActivities extends React.Component<
  RouteComponentProps,
  IState
> {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      activities: [],
      container: { name: this.props.match.params['container'] },
      redirect: null,
    };
  }

  componentDidMount() {
    const { container } = this.state;
    this.queryActivities(container.name);
  }

  render() {
    const tabs = ['Detail', 'Activity', 'Images'];
    const description = '';
    if (this.state.redirect === 'detail') {
      return (
        <Redirect
          to={formatPath(Paths.executionEnvironmentDetail, {
            container: this.state.container.name,
          })}
        />
      );
    } else if (this.state.redirect === 'images') {
      return (
        <Redirect
          to={formatPath(Paths.executionEnvironmentDetailImages, {
            container: this.state.container.name,
          })}
        />
      );
    }
    return (
      <React.Fragment>
        <BaseHeader
          title={this.state.container.name}
          breadcrumbs={
            <Breadcrumbs
              links={[
                {
                  url: Paths.executionEnvironments,
                  name: 'Container Registry',
                },
                { name: this.state.container.name },
              ]}
            />
          }
        >
          <Tooltip content={description}>
            <p className={'truncated'}>{description}</p>
          </Tooltip>
          <span />
          <div className='tab-link-container'>
            <div className='tabs'>
              <Tabs
                tabs={tabs}
                params={{ tab: 'activity' }}
                updateParams={p => this.setState({ redirect: p.tab })}
              />
            </div>
          </div>
        </BaseHeader>
        <Main>{this.renderActivity()}</Main>
      </React.Fragment>
    );
  }

  renderActivity() {
    const { activities } = this.state;
    if (activities.length === 0) {
      return (
        <EmptyStateNoData
          title={'No activities yet'}
          description={'Activities will appear once you push something'}
        />
      );
    }
    return (
      <Flex>
        <Flex direction={{ default: 'column' }} flex={{ default: 'flex_1' }}>
          <FlexItem>
            <Section className='body'>
              <table aria-label='Activities' className='pf-c-table'>
                <SortTable
                  options={{
                    headers: [
                      { title: 'Change', type: 'none', id: 'change' },
                      { title: 'Date', type: 'none', id: 'date' },
                    ],
                  }}
                  params={{}}
                  updateParams={() => {}}
                />
                <tbody>
                  {activities.map((action, i) => {
                    return (
                      <tr key={i}>
                        <th>{action.action}</th>
                        <Tooltip
                          content={moment(action.created).format(
                            'MMMM Do YYYY',
                          )}
                        >
                          <th>{moment(action.created).fromNow()}</th>
                        </Tooltip>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Section>
          </FlexItem>
        </Flex>
      </Flex>
    );
  }

  queryActivities(name) {
    this.setState({ loading: true }, () => {
      ActivitiesAPI.list(name).then(result => {
        let activities = [];
        result.data.data.forEach(activity => {
          {
            activity.added.forEach(action => {
              let activityDescription;
              if (action.pulp_type === 'container.tag') {
                let removed = activity.removed.find(item => {
                  return item.tag_name === action.tag_name;
                });
                if (!!removed) {
                  activityDescription = (
                    <React.Fragment>
                      <Label variant='outline' icon={<TagIcon />}>
                        {action.tag_name}
                      </Label>{' '}
                      was moved to{' '}
                      <Label color='blue'>
                        {truncateSha(action.manifest_digest)}
                      </Label>{' '}
                      from
                      <Label color='blue'>
                        {truncateSha(removed.manifest_digest)}
                      </Label>
                    </React.Fragment>
                  );
                } else {
                  activityDescription = (
                    <React.Fragment>
                      <Label variant='outline' icon={<TagIcon />}>
                        {action.tag_name}
                      </Label>{' '}
                      was added to{' '}
                      <Label color='blue'>
                        {truncateSha(action.manifest_digest)}
                      </Label>
                    </React.Fragment>
                  );
                }
              } else {
                activityDescription = (
                  <React.Fragment>
                    <Label color='blue'>
                      {truncateSha(action.manifest_digest)}
                    </Label>{' '}
                    was added
                  </React.Fragment>
                );
              }
              activities.push({
                created: activity.pulp_created,
                action: activityDescription,
              });
            });
            activity.removed.forEach(action => {
              let activityDescription;
              if (action.pulp_type === 'container.tag') {
                if (
                  !activity.added.find(item => {
                    return item.tag_name === action.tag_name;
                  })
                ) {
                  activityDescription = (
                    <React.Fragment>
                      <Label variant='outline' icon={<TagIcon />}>
                        {action.tag_name}
                      </Label>{' '}
                      was removed from{' '}
                      <Label color='blue'>
                        {truncateSha(action.manifest_digest)}
                      </Label>
                    </React.Fragment>
                  );
                } else {
                  // skip one added as moved
                  return;
                }
              } else {
                activityDescription = (
                  <React.Fragment>
                    <Label color='blue'>
                      {truncateSha(action.manifest_digest)}
                    </Label>{' '}
                    was removed
                  </React.Fragment>
                );
              }
              activities.push({
                created: activity.pulp_created,
                action: activityDescription,
              });
            });
          }
        });
        let lastActivity = activities[activities.length - 1];
        if (!!lastActivity) {
          activities.push({
            created: lastActivity.created,
            action: (
              <React.Fragment>
                {this.state.container.name} was added
              </React.Fragment>
            ),
          });
        }
        this.setState({ activities: activities, loading: false });
      });
    });
  }
}

export default withRouter(ExecutionEnvironmentDetailActivities);
