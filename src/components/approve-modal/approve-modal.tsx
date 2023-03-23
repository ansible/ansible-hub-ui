import { t } from '@lingui/macro';
import {
  Button,
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
import { CollectionVersion, CollectionVersionAPI, Repositories } from 'src/api';
import { Repository } from 'src/api/response-types/repositories';
import {
  AlertList,
  AlertType,
  AppliedFilters,
  CheckboxRow,
  CompoundFilter,
  Pagination,
  SortTable,
} from 'src/components';
import { Constants } from 'src/constants';
import {
  errorMessage,
  parsePulpIDFromURL,
  waitForTaskUrl,
} from 'src/utilities';

interface IProps {
  closeAction: () => void;
  collectionVersion: CollectionVersion;
  addAlert: (alert) => void;
  allRepositories: Repository[];
  finishAction: () => void;
}

export const ApproveModal = (props: IProps) => {
  const [inputText, setInputText] = useState('');
  const [repositoryList, setRepositoryList] = useState<Repository[]>([]);
  const [itemsCount, setItemsCount] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [fixedRepos, setFixedRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({
    page: 1,
    page_size: 10,
    sort: 'name',
  });

  function approve() {
    function failedToLoadRepo(status?, statusText?) {
      setLoading(false);
      addAlert({
        title: t`Failed to load pulp_id of collection repository.`,
        variant: 'danger',
        description: errorMessage(status, statusText),
      });
    }

    setLoading(true);

    const originRepoName = props.collectionVersion.repository_list.find(
      (repo) => repo == Constants.NEEDSREVIEW || repo == Constants.NOTCERTIFIED,
    );
    const reposToApprove = [];

    // fill repos that are actualy needed to approve, some of them may already contain the collection, those dont need to be approved again
    // this handles the possible inconsistent state
    selectedRepos.forEach((repo) => {
      if (!fixedRepos.includes(repo)) {
        reposToApprove.push(repo);
      }
    });

    const repositoriesRef = props.allRepositories
      .filter((repo) => reposToApprove.includes(repo.name))
      .map((repo) => repo.pulp_href);

    Repositories.getRepository({ name: originRepoName })
      .then((data) => {
        if (data.data.results.length == 0) {
          failedToLoadRepo('', t`Repository name ${originRepoName} not found.`);
        } else {
          const pulp_id = parsePulpIDFromURL(data.data.results[0].pulp_href);
          CollectionVersionAPI.get(props.collectionVersion.id)
            .then((data) => {
              Repositories.moveCollectionVersion(
                pulp_id,
                [data.data.pulp_href],
                repositoriesRef,
              )
                .then((task) => {
                  return waitForTaskUrl(task['data'].task);
                })
                .then(() => {
                  setLoading(false);
                  props.finishAction();
                  props.addAlert({
                    title: t`Certification status for collection "${props.collectionVersion.namespace} ${props.collectionVersion.name} v${props.collectionVersion.version}" has been successfully updated.`,
                    variant: 'success',
                    description: '',
                  });
                })
                .catch(({ response: { status, statusText } }) => {
                  setLoading(false);
                  addAlert({
                    title: t`Failed to approve collection.`,
                    variant: 'danger',
                    description: errorMessage(status, statusText),
                  });
                });
            })
            .catch(({ response: { status, statusText } }) => {
              setLoading(false);
              addAlert({
                title: t`Failed to load collection.`,
                variant: 'danger',
                description: errorMessage(status, statusText),
              });
            });
        }
      })
      .catch(({ response: { status, statusText } }) => {
        failedToLoadRepo(status, statusText);
      });
  }

  function addAlert(alert: AlertType) {
    setAlerts((prevAlerts) => [...prevAlerts, alert]);
  }

  function closeAlert() {
    setAlerts([]);
  }

  function changeSelection(name) {
    if (fixedRepos.includes(name)) {
      return;
    }

    const checked = selectedRepos.includes(name);

    if (checked) {
      // remove
      setSelectedRepos(selectedRepos.filter((element) => element != name));
    } else {
      // add
      setSelectedRepos([...selectedRepos, name]);
    }
  }

  function loadRepos() {
    // modify params
    const par = { ...params };
    par['pulp_label_select'] = 'pipeline=approved';
    par['ordering'] = par['sort'];
    delete par['sort'];
    setLoading(true);

    Repositories.list(par)
      .then((data) => {
        setLoading(false);
        setRepositoryList(data.data.results);
        setItemsCount(data.data.count);
      })
      .catch(({ response: { status, statusText } }) => {
        setLoading(false);
        addAlert({
          title: t`Failed to load repositories.`,
          variant: 'danger',
          description: errorMessage(status, statusText),
        });
      });
  }

  function renderLabels() {
    const labels = (
      <>
        <LabelGroup>
          {selectedRepos.map((name) => {
            let label = null;
            if (fixedRepos.includes(name)) {
              label = <Label>{name}</Label>;
            } else {
              label = (
                <Label onClose={() => changeSelection(name)}>{name}</Label>
              );
            }
            return <>{label} </>;
          })}
        </LabelGroup>
      </>
    );

    return (
      <>
        <Flex>
          <FlexItem>
            <b>{t`Selected`}</b>
          </FlexItem>
          <FlexItem>{labels}</FlexItem>
        </Flex>
      </>
    );
  }

  useEffect(() => {
    loadRepos();
  }, [params]);

  useEffect(() => {
    const fixedReposLocal = [];
    const selectedReposLocal = [];

    // check for approval repos that are already in collection and select them in UI
    // this is handling of situation when collection is in inconsistent state
    props.collectionVersion.repository_list.forEach((repo) => {
      const count = props.allRepositories.filter((r) => r.name == repo).length;
      if (count > 0) {
        fixedReposLocal.push(repo);
        selectedReposLocal.push(repo);
      }
    });

    setSelectedRepos(selectedReposLocal);
    setFixedRepos(fixedReposLocal);
  }, []);

  function renderTable() {
    if (!props.collectionVersion) {
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
                isSelected={selectedRepos.includes(repo.name)}
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
  }

  return (
    <>
      <Modal
        actions={[
          <Button
            key='confirm'
            onClick={approve}
            variant='primary'
            isDisabled={
              selectedRepos.length - fixedRepos.length <= 0 || loading
            }
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
          {renderLabels()}
          <div className='toolbar hub-toolbar'>
            <Toolbar>
              <ToolbarGroup>
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

        <AlertList alerts={alerts} closeAlert={() => closeAlert()} />
      </Modal>
    </>
  );
};
