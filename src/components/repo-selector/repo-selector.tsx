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
import './repo-selector.scss';

interface IProps {
  selectedRepo: string;
  // Path of the component that's using the component. This is required so that
  // the url for the repo can be updated correctly.
  path: Paths;
  pathParams?: any;
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

    return (
      <Flex>
        <FlexItem>
          <InputGroup>
            <InputGroupText
              variant='plain'
              className='input-group-text-no-wrap'
            >
              Filter by repository
            </InputGroupText>
            <Select
              className='nav-select'
              isDisabled={this.props.isDisabled}
              isOpen={this.state.selectExpanded}
              isPlain={false}
              onSelect={(event, value) => {
                const originalRepo = this.props.selectedRepo;
                const newRepo = this.getRepoBasePath(value.toString());

                this.setState({ selectExpanded: false });

                if (newRepo !== originalRepo) {
                  const path = formatPath(this.props.path, {
                    ...this.props.pathParams,
                    repo: newRepo,
                  });
                  this.context.setRepo(path);
                }
              }}
              onToggle={isExpanded => {
                this.setState({ selectExpanded: isExpanded });
              }}
              selections={this.getRepoName(this.props.selectedRepo)}
              variant='single'
            >
              <SelectOption key={'published'} value={_`Published`} />
              <SelectOption key={'rh-certified'} value={_`Red Hat Certified`} />
              <SelectOption key={'community'} value={_`Community`} />
            </Select>
          </InputGroup>
        </FlexItem>
      </Flex>
    );
  }

  private getRepoName(basePath) {
    const newRepoName = Object.keys(Constants.REPOSITORYNAMES).find(
      key => Constants.REPOSITORYNAMES[key] === basePath,
    );

    // allowing the repo to go through even if isn't one that we support so
    // that 404s bubble up naturally from the child components.
    if (!newRepoName) {
      return basePath;
    }
    return newRepoName;
  }

  private getRepoBasePath(repoName) {
    if (Constants.REPOSITORYNAMES[repoName]) {
      return Constants.REPOSITORYNAMES[repoName];
    }

    return repoName;
  }
}
