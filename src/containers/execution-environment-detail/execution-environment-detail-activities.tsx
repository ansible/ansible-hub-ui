import { Trans, t } from '@lingui/macro';
import { Button, Flex, FlexItem } from '@patternfly/react-core';
import { Table, Tbody, Td, Tr } from '@patternfly/react-table';
import React, { Component, type ReactFragment } from 'react';
import { Link } from 'react-router-dom';
import { ActivitiesAPI } from 'src/api';
import {
  DateComponent,
  EmptyStateNoData,
  ShaLabel,
  SortTable,
  TagLabel,
} from 'src/components';
import { Paths, formatEEPath } from 'src/paths';
import { withRouter } from 'src/utilities';
import { type IDetailSharedProps, withContainerRepo } from './base';
import './execution-environment-detail.scss';

interface IState {
  loading: boolean;
  activities: { created: string; action: ReactFragment }[];
  redirect: string;
  page: number;
}

class ExecutionEnvironmentDetailActivities extends Component<
  IDetailSharedProps,
  IState
> {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      activities: [],
      redirect: null,
      page: 0,
    };
  }

  componentDidMount() {
    this.queryActivities(this.props.containerRepository.name);
  }

  render() {
    return this.renderActivity();
  }

  renderActivity() {
    const { activities } = this.state;
    if (activities.length === 0) {
      return (
        <EmptyStateNoData
          title={t`No activities yet`}
          description={t`Activities will appear once you push something`}
        />
      );
    }
    return (
      <Flex>
        <Flex direction={{ default: 'column' }} flex={{ default: 'flex_1' }}>
          <FlexItem>
            <section className='body'>
              <Table aria-label={t`Activities`}>
                <SortTable
                  options={{
                    headers: [
                      { title: t`Change`, type: 'none', id: 'change' },
                      { title: t`Date`, type: 'none', id: 'date' },
                    ],
                  }}
                  params={{}}
                  updateParams={() => null}
                />
                <Tbody>
                  {activities.map((action, i) => {
                    return (
                      <Tr key={i}>
                        <Td>{action.action}</Td>
                        {action.created ? (
                          <Td>
                            <DateComponent date={action.created} />
                          </Td>
                        ) : (
                          <Td />
                        )}
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </section>
          </FlexItem>
        </Flex>
      </Flex>
    );
  }

  queryActivities(name) {
    const manifestLink = (digestOrTag) =>
      formatEEPath(Paths.executionEnvironmentManifest, {
        container: name,
        digest: digestOrTag,
      });

    const ShaLink = ({ digest }) => (
      <Link to={manifestLink(digest)}>
        <ShaLabel digest={digest} />
      </Link>
    );
    const TagLink = ({ tag }) => (
      <Link to={manifestLink(tag)}>
        <TagLabel tag={tag} />
      </Link>
    );

    this.setState({ loading: true }, () => {
      ActivitiesAPI.list(name, this.state.page)
        .then((result) => {
          const activities = [];
          result.data.data.forEach((activity) => {
            {
              activity.added.forEach((action) => {
                let activityDescription;
                if (action.pulp_type === 'container.tag') {
                  const removed = activity.removed.find((item) => {
                    return item.tag_name === action.tag_name;
                  });
                  if (removed) {
                    activityDescription = (
                      <>
                        <Trans>
                          <TagLink tag={action.tag_name} /> was moved to{' '}
                          <ShaLink digest={action.manifest_digest} /> from{' '}
                          <ShaLink digest={removed.manifest_digest} />
                        </Trans>
                      </>
                    );
                  } else {
                    activityDescription = (
                      <>
                        <Trans>
                          <TagLink tag={action.tag_name} /> was added to{' '}
                          <ShaLink digest={action.manifest_digest} />
                        </Trans>
                      </>
                    );
                  }
                } else {
                  activityDescription = (
                    <>
                      <Trans>
                        <ShaLink digest={action.manifest_digest} /> was added
                      </Trans>
                    </>
                  );
                }
                activities.push({
                  created: activity.created_at,
                  action: activityDescription,
                });
              });
              activity.removed.forEach((action) => {
                let activityDescription;
                if (action.pulp_type === 'container.tag') {
                  if (
                    !activity.added.find((item) => {
                      return item.tag_name === action.tag_name;
                    })
                  ) {
                    activityDescription = (
                      <>
                        <Trans>
                          <TagLabel tag={action.tag_name} /> was removed from{' '}
                          <ShaLink digest={action.manifest_digest} />
                        </Trans>
                      </>
                    );
                  } else {
                    // skip one added as moved
                    return;
                  }
                } else {
                  activityDescription = (
                    <>
                      <Trans>
                        <ShaLabel digest={action.manifest_digest} /> was removed
                      </Trans>
                    </>
                  );
                }
                activities.push({
                  created: activity.created_at,
                  action: activityDescription,
                });
              });
            }
          });
          if (result.data.links.next) {
            this.setState({ page: this.state.page + 1 });
            activities.push({
              created: '',
              action: (
                <Button
                  variant={'link'}
                  onClick={() => this.queryActivities(name)}
                >
                  {' '}
                  Load more{' '}
                </Button>
              ),
            });
          } else {
            const lastActivity = activities.at(-1);
            if (lastActivity) {
              activities.push({
                created: lastActivity.created,
                action: (
                  <>{t`${this.props.containerRepository.name} was added`}</>
                ),
              });
            }
          }
          // remove last activity (Load more button) and add newly fetched activities
          this.setState({
            activities: this.state.activities.slice(0, -1).concat(activities),
            loading: false,
          });
        })
        .catch(() => this.setState({ redirect: 'notFound' }));
    });
  }
}

export default withRouter(
  withContainerRepo(ExecutionEnvironmentDetailActivities),
);
