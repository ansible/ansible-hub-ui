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
  Label,
} from '@patternfly/react-core';
import { ParamHelper } from '../../utilities';
import {
  WarningTriangleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SyncAltIcon,
  OutlinedClockIcon,
} from '@patternfly/react-icons';
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


  render() {
    return (
      <React.Fragment>
        <BaseHeader title={'Task Management'} />
        <Main>{this.renderTable()}</Main>
      </React.Fragment>
    );

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
          title: 'Status',
          type: 'alpha',
          id: 'state',
        },
        {
          title: 'Error',
          type: 'alpha',
          id: 'error',
        },
        {
          title: 'Created on',
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
        {state === 'failed' ? (
          <td>
            <Label
              variant='outline'
              color='red'
              icon={<ExclamationCircleIcon />}
            >
              {state}
            </Label>
          </td>
        ) : state === 'completed' ? (
          <td>
            <Label variant='outline' color='green' icon={<CheckCircleIcon />}>
              {state}
            </Label>
          </td>
        ) : state === 'running' ? (
          <td>
            <Label variant='outline' color='blue' icon={<SyncAltIcon />}>
              {state}
            </Label>
          </td>
        ) : state === 'waiting' ? (
          <td>
            <Label variant='outline' color='grey' icon={<OutlinedClockIcon />}>
              {state}
            </Label>
          </td>
        ) : (
          <td>
            <Label variant='outline'>{state}</Label>
          </td>
        )}

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
