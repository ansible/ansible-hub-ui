import { t } from '@lingui/macro';
import * as React from 'react';

import {
  Flex,
  FlexItem,
  InputGroup,
  InputGroupText,
  Select,
  SelectOption,
} from '@patternfly/react-core';
import { Constants } from 'src/constants';
import { Paths, formatPath } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';
import { getValueFromFunction } from 'src/utilities';

import './repo-selector.scss';

interface IProps {
  selectedRepo: string;
  // Path of the component that's using the component. This is required so that
  // the url for the repo can be updated correctly.
  path: Paths;
  pathParams?: Record<string, string>;
  isDisabled?: boolean;
}

interface IState {
  selectExpanded: boolean;
}

export class RepoSelector extends React.Component<IProps, IState> {
  static contextType = AppContext;
  constructor(props) {
    super(props);

    this.state = { selectExpanded: false };
  }

  render() {
    if (DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE) {
      return null;
    }

    const repoNames = Constants.REPOSITORYNAMES;

    return (
      <Flex>
        <FlexItem>
          <InputGroup>
            <InputGroupText
              style={{ paddingLeft: 0 }}
              variant='plain'
              className='hub-input-group-text-no-wrap'
            >
              {t`Filter by repository`}
            </InputGroupText>
            <Select
              className='nav-select'
              isDisabled={this.props.isDisabled}
              isOpen={this.state.selectExpanded}
              isPlain={false}
              onSelect={(event: React.ChangeEvent<HTMLInputElement>) => {
                const originalRepo = this.props.selectedRepo;
                const newRepo = this.getRepoName(event.target.name);

                this.setState({ selectExpanded: false });

                if (newRepo !== originalRepo) {
                  const path = formatPath(this.props.path, {
                    ...this.props.pathParams,
                    repo: event.target.name,
                  });
                  this.context.setRepo(path);
                }
              }}
              onToggle={(isExpanded) => {
                this.setState({ selectExpanded: isExpanded });
              }}
              selections={this.getRepoName(this.props.selectedRepo)}
              variant='single'
            >
              {Object.keys(repoNames).map((option) => (
                <SelectOption
                  name={option}
                  key={option}
                  value={getValueFromFunction(repoNames[option])}
                />
              ))}
            </Select>
          </InputGroup>
        </FlexItem>
      </Flex>
    );
  }

  private getRepoName(repoName) {
    const repo = Constants.REPOSITORYNAMES[repoName];
    return repo ? getValueFromFunction(repo) : repoName;
  }
}
