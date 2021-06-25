import axios from 'axios';
import * as React from 'react';
import { BaseHeader } from '../headers/base-header';

import { SortTable } from '../sort-table/sort-table';

interface IState {
    taskList: Array<string>
}

export class TaskListView extends React.Component<IState> {
  constructor(props) {
    super(props);
 
  }
  
  fetchData = async () => {
    const res = await axios.get('http://pulp/pulp/api/v3/tasks/');
    const taskList = await res.data;
    console.log('Tasks: ', taskList);
    this.setState({ taskList: taskList });
  };

  render() {
    let sortTableOptions = {
      headers: [
        {
          title: 'Name',
          type: 'alpha',
          id: 'name',
        },
        {
          title: 'State',
          type: 'none',
          id: 'alpha',
        },
        {
          title: 'Started at',
          type: 'none',
          id: 'alpha',
        },
        {
          title: 'Finished at',
          type: 'none',
          id: 'alpha',
        },
      ],
    };
    return (
        <React.Fragment>
            <BaseHeader title='Task Management'>
            </BaseHeader>
      <table aria-label='Tasks'>
        <SortTable
          options={sortTableOptions}
          params={params}
          updateParams={p => console.log(p)}
        />
    
      </table>
      </React.Fragment>
    );
  }
}
