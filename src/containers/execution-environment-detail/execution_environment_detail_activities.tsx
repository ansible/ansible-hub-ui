import * as React from 'react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';
import {
  Main,
  SortTable,
  EmptyStateNoData,
  ShaLabel,
  ExecutionEnvironmentHeader,
} from '../../components';
import { Section } from '@redhat-cloud-services/frontend-components';
import { FlexItem, Flex, Tooltip, Label } from '@patternfly/react-core';
import { formatPath, Paths } from '../../paths';
import { ActivitiesAPI } from '../../api';
import * as moment from 'moment';
import './execution-environment-detail.scss';
import { TagIcon } from '@patternfly/react-icons';

interface IState {
  loading: boolean;
  activities: { created: string; action: React.ReactFragment }[];
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
      redirect: null,
    };
  }

  componentDidMount() {
    this.queryActivities(this.props.match.params['container']);
  }

  render() {
    if (this.state.redirect === 'detail') {
      return (
        <Redirect
          to={formatPath(Paths.executionEnvironmentDetail, {
            container: this.props.match.params['container'],
          })}
        />
      );
    } else if (this.state.redirect === 'images') {
      return (
        <Redirect
          to={formatPath(Paths.executionEnvironmentDetailImages, {
            container: this.props.match.params['container'],
          })}
        />
      );
    }
    return (
      <React.Fragment>
        <ExecutionEnvironmentHeader
          id={this.props.match.params['container']}
          updateParams={p => this.setState({ redirect: p.tab })}
          tab='activity'
        />
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
                      was moved to <ShaLabel digest={action.manifest_digest} />{' '}
                      from
                      <ShaLabel digest={removed.manifest_digest} />
                    </React.Fragment>
                  );
                } else {
                  activityDescription = (
                    <React.Fragment>
                      <Label variant='outline' icon={<TagIcon />}>
                        {action.tag_name}
                      </Label>{' '}
                      was added to <ShaLabel digest={action.manifest_digest} />
                    </React.Fragment>
                  );
                }
              } else {
                activityDescription = (
                  <React.Fragment>
                    <ShaLabel digest={action.manifest_digest} /> was added
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
                      <ShaLabel digest={action.manifest_digest} />
                    </React.Fragment>
                  );
                } else {
                  // skip one added as moved
                  return;
                }
              } else {
                activityDescription = (
                  <React.Fragment>
                    <ShaLabel digest={action.manifest_digest} /> was removed
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
                {this.props.match.params['container']} was added
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
