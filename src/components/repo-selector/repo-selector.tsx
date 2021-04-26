import * as React from 'react';

import { Flex, FlexItem, Select, SelectOption } from '@patternfly/react-core';
import { Constants } from 'src/constants';
import { Paths, formatPath } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';

interface IProps {
  selectedRepo: string;
  // Path of the component that's using the component. This is required so that
  // the url for the repo can be updated correctly.
  path: Paths;
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
    return (
      <Flex>
        <FlexItem>
          <Select
            className='nav-select'
            variant='single'
            isOpen={this.state.selectExpanded}
            selections={this.getRepoName(this.props.selectedRepo)}
            isPlain={false}
            onToggle={isExpanded => {
              this.setState({ selectExpanded: isExpanded });
            }}
            onSelect={(event, value) => {
              const originalRepo = this.props.selectedRepo;
              const newRepo = this.getRepoBasePath(value.toString());

              this.setState({ selectExpanded: false });

              if (newRepo !== originalRepo) {
                const path = formatPath(this.props.path, { repo: newRepo });
                this.context.setRepo(path);
              }
            }}
          >
            <SelectOption key={'published'} value={'Published'} />
            <SelectOption key={'rh-certified'} value={'Red Hat Certified'} />
            <SelectOption key={'community'} value={'Community'} />
          </Select>
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
