import axios from 'axios';
import * as React from 'react';
import * as moment from 'moment';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  ToolbarContent,
  Button,
} from '@patternfly/react-core';
import { ParamHelper } from '../../utilities';
import { WarningTriangleIcon } from '@patternfly/react-icons';
import {
  AlertList,
  AlertType,
  AppliedFilters,
  BaseHeader,
  CompoundFilter,
  DateComponent,
  EmptyStateFilter,
  EmptyStateNoData,
  LoadingPageSpinner,
  Main,
  Pagination,
  SortTable,
  Tooltip,
  closeAlertMixin,
} from 'src/components';
import { TaskManagementAPI } from 'src/api';
import { TaskType } from 'src/api/response-types/task';

interface IState {
  params: {
    page?: number;
    page_size?: number;
  };
  loading: boolean;
  //What would 'items' be here? The list of tasks from the API?
  items: Array<TaskType>;
  itemCount: number;
  alerts: AlertType[];
}

export class TaskListView extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    if (!params['page_size']) {
      params['page_size'] = 10;
    }

    if (!params['sort']) {
      params['sort'] = 'name';
    }

    this.state = {
      params: params,
      //items here would be the tasks, I believe
      items: [],
      loading: true,
      itemCount: 0,
      alerts: [],
    };
  }

  componentDidMount() {
    TaskManagementAPI.list().then(result => {
      console.log(result.data.results);
      this.setState({
        items: result.data.results,
        itemCount: result.data.count,
      });
    });
  }

  // My fetch attempt, pretty sure it's not working...
  //Is there somewhere we need to add our tasks path /ui/task_management with react router?

  render() {
    return (
      <React.Fragment>
        <BaseHeader title={'Task Management'} />
        <Main>{this.renderTable()}</Main>
      </React.Fragment>
    );
    //   const { params, itemCount, loading, alerts } = this.state;

    //   if (!params['sort']) {
    //     params['sort'] = 'name';
    //   }

    //   return (
    //     <React.Fragment>
    //       <AlertList
    //         alerts={alerts}
    //         closeAlert={i => this.closeAlert(i)}
    //       ></AlertList>
    //       <BaseHeader title='Task Management'></BaseHeader>
    //       //Is something like this 'noData' state applicable for the tasks?
    //       {noData && !loading ? (
    //         <EmptyStateNoData
    //           title={'No container repositories yet'}
    //           description={
    //             'You currently have no container repositories. Add a container repository via the CLI to get started.'
    //           }
    //           //I don't think a button to add images is applicable here...
    //           button={pushImagesButton}
    //         />
    //       ) : (
    //         <Main>
    //           {loading ? (
    //             <LoadingPageSpinner />
    //           ) : (
    //             <Section className='body'>
    //               <div className='toolbar'>
    //                 <Toolbar>
    //                   <ToolbarContent>
    //                     <ToolbarGroup>
    //                       <ToolbarItem>
    //                         <CompoundFilter
    //                           updateParams={p => {
    //                             p['page'] = 1;
    //                             this.updateParams(p, () =>
    //                               // rather than query environments, this would be something like query tasks...
    //                               this.queryEnvironments(),
    //                             );
    //                           }}
    //                           params={params}
    //                           filterConfig={[
    //                             {
    //                               id: 'name',
    //                               title: 'Task name',
    //                             },
    //                           ]}
    //                         />
    //                       </ToolbarItem>
    //                       //I assume pushImageButton is not applicable here
    //                       <ToolbarItem>{pushImagesButton}</ToolbarItem>
    //                     </ToolbarGroup>
    //                   </ToolbarContent>
    //                 </Toolbar>
    //                 <Pagination
    //                   params={params}
    //                   updateParams={p =>
    //                     // again, queryTasks or so
    //                     this.updateParams(p, () => this.queryEnvironments())
    //                   }
    //                   count={itemCount}
    //                   isTop
    //                 />
    //               </div>
    //               <div>
    //                 <AppliedFilters
    //                   updateParams={p =>
    //                     //queryTasks
    //                     this.updateParams(p, () => this.queryEnvironments())
    //                   }
    //                   params={params}
    //                   ignoredParams={['page_size', 'page', 'sort']}
    //                 />
    //               </div>
    //               {this.renderTable(params)}
    //               <div style={{ paddingTop: '24px', paddingBottom: '8px' }}>
    //                 <Pagination
    //                   params={params}
    //                   updateParams={p =>
    //                     //queryTasks
    //                     this.updateParams(p, () => this.queryEnvironments())
    //                   }
    //                   count={itemCount}
    //                 />
    //               </div>
    //             </Section>
    //           )}
    //         </Main>
    //       )}
    //     </React.Fragment>
    //   );
    // }

    // // Will we be using something like this for renderTable?
    // private renderTable(params) {
    //   const { items } = this.state;
    //   if (items.length === 0) {
    //     return <EmptyStateFilter />;
    //   }

    //   let sortTableOptions = {
    //     headers: [
    //       {
    //         title: 'Task name',
    //         type: 'alpha',
    //         id: 'name',
    //       },
    //       {
    //         title: 'State',
    //         type: 'alpha',
    //         id: 'state',
    //       },
    //       {
    //         title: 'Error',
    //         type: 'alpha',
    //         id: 'error',
    //       },
    //       {
    //         title: 'Date created',
    //         type: 'none',
    //         id: 'pulp_created',
    //       },
    //       {
    //         title: 'Started at',
    //         type: 'none',
    //         id: 'started_at',
    //       },
    //       {
    //         title: 'Finished at',
    //         type: 'none',
    //         id: 'finished_at',
    //       },
    //       {
    //         title: 'Progress reports',
    //         type: 'none',
    //         id: 'progress_reports',
    //       },
    //       {
    //         title: 'Parent task',
    //         type: 'none',
    //         id: 'parent_task',
    //       },
    //       {
    //         title: 'Child tasks',
    //         type: 'none',
    //         id: 'child_tasks',
    //       },
    //     ],
    //   };

    //   return (
    //     <table aria-label='Task list' className='content-table pf-c-table'>
    //       <SortTable
    //         options={sortTableOptions}
    //         params={params}
    //         updateParams={p =>
    //           //How would this be different for the task list? Does this refer to the API call / setState down on 229?
    //           this.updateParams(p, () => this.queryEnvironments())
    //         }
    //       />
    //       <tbody>{items.map((user, i) => this.renderTableRow(user, i))}</tbody>
    //     </table>
    //   );
    // }

    // private renderTableRow(item: any, index: number) {
    //   const {
    //     name,
    //     pulp_href,
    //     state,
    //     error,
    //     pulp_created,
    //     started_at,
    //     finished_at,
    //     progress_reports,
    //     parent_task,
    //     child_tasks,
    //   } = item;
    //   return (
    //     <tr aria-labelledby={name} key={index}>
    //       <td>
    //         <Link
    //           //this path would be to the task detail, correct? Or to the pulp_href
    //           to={formatPath(Paths.taskList, {
    //             container: item.pulp.distribution.base_path,
    //           })}
    //         >
    //           {name}
    //         </Link>
    //       </td>
    //       <td>{state}</td>
    //       // error is an object. Is this the proper way to render it?
    //       {error ? (
    //         <td className={'pf-m-truncate'}>
    //           <Tooltip content={error}>{error}</Tooltip>
    //         </td>
    //       ) : (
    //         <td></td>
    //       )}
    //       <td>
    //         <DateComponent date={pulp_created} />
    //       </td>
    //       <td>
    //         <DateComponent date={started_at} />
    //       </td>
    //       {finished_at ? (
    //         <td>
    //           <DateComponent date={finished_at} />
    //         </td>
    //       ) : (
    //         <td></td>
    //       )}
    //       {progress_reports ? (
    //         <td className={'pf-m-truncate'}>
    //           //given this is an Array, is this the proper way to render it?
    //           <Tooltip content={progress_reports}>{progress_reports}</Tooltip>
    //         </td>
    //       ) : (
    //         <td></td>
    //       )}
    //     </tr>
    //   );
    // }

    // // This must be where we call the pulp API and set the state appropriately.

    // private get updateParams() {
    //   return ParamHelper.updateParamsMixin();
    // }

    // private get closeAlert() {
    //   return closeAlertMixin('alerts');
  }

  private renderTable() {
    const { items } = this.state;
    // if (items.length === 0) {
    //   return <EmptyStateFilter />;
    // }

    let sortTableOptions = {
      headers: [
        {
          title: 'Task name',
          type: 'alpha',
          id: 'name',
        },
        {
          title: 'State',
          type: 'alpha',
          id: 'state',
        },
        {
          title: 'Error',
          type: 'alpha',
          id: 'error',
        },
        {
          title: 'Date created',
          type: 'none',
          id: 'pulp_created',
        },
        {
          title: 'Started at',
          type: 'none',
          id: 'started_at',
        },
        {
          title: 'Finished at',
          type: 'none',
          id: 'finished_at',
        },
      ],
    };

    return (
      <table aria-label='Task list' className='content-table pf-c-table'>
        <SortTable
          options={sortTableOptions}
          params={{}}
          updateParams={p =>
            //How would this be different for the task list? Does this refer to the API call / setState down on 229?
            console.log('Table')
          }
        />
        <tbody>{items.map((item, i) => this.renderTableRow(item, i))}</tbody>
      </table>
    );
  }

  private renderTableRow(item: any, index: number) {
    const { name, state, error, pulp_created, started_at, finished_at } = item;
    return (
      <tr aria-labelledby={name} key={index}>
        <td>{name}</td>
        <td>{state}</td>
        <td>{error}</td>
        <td>
          <DateComponent date={pulp_created} />
        </td>
        <td>
          <DateComponent date={started_at} />
        </td>
        <td>
          <DateComponent date={finished_at} />
        </td>
      </tr>
    );
  }
}

export default withRouter(TaskListView);
