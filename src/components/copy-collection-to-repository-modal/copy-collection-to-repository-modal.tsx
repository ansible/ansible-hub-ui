import { t } from '@lingui/macro';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  DropdownToggle,
  DropdownToggleCheckbox,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  Modal,
  Spinner,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import {
  AnsibleRepositoryType,
  CollectionVersionSearch,
  Repositories,
  SigningServiceAPI,
} from 'src/api';
import {
  AlertType,
  AppliedFilters,
  CheckboxRow,
  CompoundFilter,
  Pagination,
  SortTable,
} from 'src/components';
import { useContext } from 'src/loaders/app-context';
import {
  RepositoriesUtils,
  errorMessage,
  parsePulpIDFromURL,
  taskAlert,
} from 'src/utilities';

interface IProps {
  collection: CollectionVersionSearch;
  closeAction: () => void;
  addAlert: (alert: AlertType) => void;
}

export const CopyCollectionToRepositoryModal = (props: IProps) => {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isSelectorChecked, setIsSelectorChecked] = useState(false);
  const [repositoryList, setRepositoryList] = useState<AnsibleRepositoryType[]>(
    [],
  );
  const [fixedRepos, setFixedRepos] = useState<string[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [itemsCount, setItemsCount] = useState(0);
  // const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({
    page: 1,
    page_size: 10,
    sort: 'name',
  });

  const context = useContext();

  useEffect(() => {
    loadRepos();
    loadAssociatedRepoList();
  }, []);

  useEffect(() => {
    loadRepos();
  }, [params]);

  const loadRepos = async () => {
    const par = { ...params };
    par['ordering'] = par['sort'];
    par['name__contains'] = inputText;
    delete par['sort'];

    setLoading(true);

    const repos = await Repositories.list(par);

    setItemsCount(repos.data.count);
    setRepositoryList(repos.data.results);
    setLoading(false);
  };

  const loadAllRepos = () => {
    setLoading(true);
    RepositoriesUtils.listAll().then((repos) => {
      setSelectedRepos(repos.map((repo) => repo.name));
      setRepositoryList(repos);
      setLoading(false);
    });
  };

  const loadAssociatedRepoList = async () => {
    const repoList = await RepositoriesUtils.getCollectionRepoList(
      props.collection,
    );
    setFixedRepos(repoList);
  };

  const changeSelection = (name: string) => {
    const checked = selectedRepos.includes(name);

    if (checked) {
      // remove
      setSelectedRepos(selectedRepos.filter((element) => element != name));
    } else {
      // add
      setSelectedRepos([...selectedRepos, name]);
    }
  };

  const copyToRepositories = async () => {
    setLoading(true);
    const { collection_version, repository } = props.collection;

    const pulpId = parsePulpIDFromURL(repository.pulp_href);

    const signingServiceName =
      context.settings.GALAXY_COLLECTION_SIGNING_SERVICE;

    let signingService = null;
    try {
      const signingList = await SigningServiceAPI.list({
        name: signingServiceName,
      });
      signingService = signingList.data.results[0].pulp_href;
    } catch {
      setLoading(false);
      props.addAlert({
        title: t`Failed to copy collection version.`,
        variant: 'danger',
        description: t`Signing service ${signingServiceName} not found`,
      });
      return;
    }

    const repoHrefs = repositoryList
      .filter((repo) => selectedRepos.includes(repo.name))
      .map((repo) => repo.pulp_href);

    Repositories.copyCollectionVersion(
      pulpId,
      [collection_version.pulp_href],
      repoHrefs,
      signingService,
    )
      .then(({ data }) => {
        selectedRepos.map((repo) => {
          props.addAlert(
            taskAlert(
              data.task,
              t`Started adding ${collection_version.namespace}.${collection_version.name} v${collection_version.version} from "${repository.name}" to repository "${repo}".`,
            ),
          );
        });
      })
      .catch((e) => {
        setLoading(false);
        props.addAlert({
          variant: 'danger',
          title: t`Collection ${collection_version.namespace}.${collection_version.name} v${collection_version.version} could not be copied.`,
          description: errorMessage(e.status, e.statusText),
        });
      });
  };

  const renderLabels = (repos: string[]) => {
    const labels = (
      <LabelGroup>
        {repos.map((name, i) => (
          <Label key={i} onClose={() => changeSelection(name)}>
            {name}
          </Label>
        ))}
      </LabelGroup>
    );
    return (
      <Flex>
        <FlexItem>
          <b>{t`Selected`}</b>
        </FlexItem>
        <FlexItem>{labels}</FlexItem>
      </Flex>
    );
  };

  const renderMultipleSelector = () => {
    const onToggle = (isOpen: boolean) => {
      setIsSelectorOpen(isOpen);
    };

    const onFocus = () => {
      const element = document.getElementById('toggle-split-button');
      element.focus();
    };

    const onSelect = () => {
      setIsSelectorOpen(false);
      onFocus();
    };

    const selectAll = () => {
      loadAllRepos();
      setIsSelectorChecked(true);
    };

    const selectPage = () => {
      setSelectedRepos(repositoryList.map((repo) => repo.name));
      setIsSelectorChecked(true);
    };

    const deselectAll = () => {
      setSelectedRepos([]);
      setIsSelectorChecked(false);
    };

    const deselectPage = () => {
      setSelectedRepos([]);
      setIsSelectorChecked(false);
    };

    const onToggleCheckbox = () => {
      setIsSelectorChecked(!isSelectorChecked);
      if (isSelectorChecked) {
        deselectPage();
      } else {
        selectPage();
      }
    };

    const dropdownItems = [
      <DropdownItem
        onClick={selectPage}
        key='select-page'
      >{t`Select page (${repositoryList.length} items)`}</DropdownItem>,
      <DropdownItem
        onClick={selectAll}
        key='select-all'
      >{t`Select all (${itemsCount} items)`}</DropdownItem>,
      <DropdownSeparator key='separator' />,
      <DropdownItem
        onClick={deselectPage}
        key='deselect-page'
      >{t`Deselect page (${repositoryList.length} items)`}</DropdownItem>,
      <DropdownItem
        onClick={deselectAll}
        key='deselect-all'
      >{t`Deselect all (${itemsCount} items)`}</DropdownItem>,
    ];

    return (
      <Dropdown
        onSelect={onSelect}
        toggle={
          <DropdownToggle
            splitButtonItems={[
              <DropdownToggleCheckbox
                id='split-button-toggle-checkbox'
                key='split-checkbox'
                aria-label='Select all'
                checked={isSelectorChecked}
                onChange={onToggleCheckbox}
              />,
            ]}
            onToggle={onToggle}
            id='toggle-split-button'
          />
        }
        isOpen={isSelectorOpen}
        dropdownItems={dropdownItems}
      />
    );
  };

  const renderTable = () => {
    if (!props.collection) {
      return;
    }

    const sortTableOptions = {
      headers: [
        {
          title: t`Name`,
          type: 'alpha',
          id: 'name',
        },
      ],
    };

    return (
      <>
        <table
          aria-label={t`Collection versions`}
          className='hub-c-table-content pf-c-table'
        >
          <SortTable
            options={sortTableOptions}
            params={params}
            updateParams={(p) => setParams(p)}
          />
          <tbody>
            {repositoryList.map((repo, i) => (
              <CheckboxRow
                rowIndex={i}
                key={repo.name}
                isSelected={
                  fixedRepos.includes(repo.name) ||
                  selectedRepos.includes(repo.name)
                }
                onSelect={() => {
                  changeSelection(repo.name);
                }}
                isDisabled={fixedRepos.includes(repo.name)}
                data-cy={`ApproveModal-CheckboxRow-row-${repo.name}`}
              >
                <td>
                  <div>{repo.name}</div>
                  <div>{repo.description}</div>
                </td>
              </CheckboxRow>
            ))}
          </tbody>
        </table>
      </>
    );
  };

  return (
    <>
      <Modal
        actions={[
          <Button
            key='confirm'
            onClick={() => copyToRepositories()}
            variant='primary'
            isDisabled={selectedRepos.length <= 0 || loading}
          >
            {t`Select`}
          </Button>,
          <Button
            key='cancel'
            onClick={props.closeAction}
            variant='link'
            isDisabled={loading}
          >
            {t`Cancel`}
          </Button>,
        ]}
        isOpen={true}
        onClose={props.closeAction}
        title={t`Select repositories`}
        variant='large'
      >
        <section className='modal-body' data-cy='modal-body'>
          {renderLabels(selectedRepos)}
          <div className='toolbar hub-toolbar'>
            <Toolbar>
              <ToolbarGroup>
                <ToolbarItem>{renderMultipleSelector()}</ToolbarItem>
                <ToolbarItem>
                  <CompoundFilter
                    inputText={inputText}
                    onChange={(text) => {
                      setInputText(text);
                    }}
                    updateParams={(p) => setParams(p)}
                    params={params}
                    filterConfig={[
                      {
                        id: 'name__icontains',
                        title: t`Repository`,
                      },
                    ]}
                  />
                </ToolbarItem>
              </ToolbarGroup>
            </Toolbar>

            <Pagination
              params={params}
              updateParams={(p) => setParams(p)}
              count={itemsCount}
              isTop
            />
          </div>
          <div>
            <AppliedFilters
              updateParams={(p) => {
                setParams(p);
                setInputText('');
              }}
              params={params}
              ignoredParams={['page_size', 'page', 'sort']}
              niceNames={{
                name__icontains: t`Name`,
              }}
            />
          </div>

          {loading ? <Spinner /> : renderTable()}

          <div className='footer'>
            <Pagination
              params={params}
              updateParams={(p) => setParams(p)}
              count={itemsCount}
            />
          </div>
        </section>
      </Modal>
    </>
  );
};
