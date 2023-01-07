import { t } from '@lingui/macro';
import { i18n } from '@lingui/core';
import React, { useState } from 'react';
import { redirect, useMatch } from 'react-router-dom';
import {
  Flex,
  FlexItem,
  InputGroup,
  InputGroupText,
  Select,
  SelectOption,
} from '@patternfly/react-core';
import { Constants } from 'src/constants';
import { formatPath } from 'src/paths';

import './repo-selector.scss';

interface IProps {
  selectedRepo: string;
  pathParams?: Record<string, string>;
  isDisabled?: boolean;
}

export const RepoSelector = ({
  selectedRepo,
  pathParams,
  isDisabled,
}: IProps) => {
  const [selectExpanded, setSelectExpanded] = useState<boolean>(false);
  const { path } = useMatch(); // Paths.namespaceByRepo, Paths.myCollectionsByRepo, Paths.searchByRepo .. TODO, works?

  const getRepoName = (repoName) => {
    const repo = Constants.REPOSITORYNAMES[repoName];
    return repo ? i18n._(repo) : repoName;
  };

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
            isDisabled={isDisabled}
            isOpen={selectExpanded}
            isPlain={false}
            onSelect={(event: React.ChangeEvent<HTMLInputElement>) => {
              const originalRepo = selectedRepo;
              const newRepo = getRepoName(event.target.name);

              setSelectExpanded(false);

              if (newRepo !== originalRepo) {
                const newPath = formatPath(path, {
                  ...pathParams,
                  repo: event.target.name,
                });
                redirect(newPath);
              }
            }}
            onToggle={(isExpanded) => setSelectExpanded(isExpanded)}
            selections={getRepoName(selectedRepo)}
            variant='single'
          >
            {Object.keys(repoNames).map((option) => (
              <SelectOption
                name={option}
                key={option}
                value={i18n._(repoNames[option])}
              />
            ))}
          </Select>
        </InputGroup>
      </FlexItem>
    </Flex>
  );
};
