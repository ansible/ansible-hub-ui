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
import { CollectionVersion, Repositories } from 'src/api';
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
import { errorMessage } from 'src/utilities';

interface IProps {
  closeAction: () => void;
  collectionVersion: CollectionVersion;
  addAlert: (alert) => void;
}

export const ApproveModal = (props: IProps) => {
  const [inputText, setInputText] = useState('');
  const [repositoryList, setRepositoryList] = useState<Repository[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({
    page: 1,
    page_size: 10,
    sort: 'name',
  });
  const [showAllSelected, setShowAllSelected] = useState(false);

  function buttonClick() {
    // TODO - waiting for API
  }

  function addAlert(alert: AlertType) {
    setAlerts((prevAlerts) => [...prevAlerts, alert]);
  }

  function closeAlert() {
    setAlerts([]);
  }

  function changeSelection(name) {
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

    Repositories.list(par)
      .then((data) => {
        setLoading(false);
        setRepositoryList(data.data.results);
        setItemCount(data.data.count);
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
          {selectedRepos.map((name) => (
            <>
              <Label onClose={() => changeSelection(name)}>{name}</Label>{' '}
            </>
          ))}
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
  }, [params, inputText]);

  function renderTable() {
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
            onClick={buttonClick}
            variant='primary'
            isDisabled={selectedRepos.length == 0}
          >
            {t`Select`}
          </Button>,
          <Button key='cancel' onClick={props.closeAction} variant='link'>
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
              count={itemCount}
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
            />
          </div>

          {loading ? <Spinner /> : renderTable()}

          <div className='footer'>
            <Pagination
              params={params}
              updateParams={(p) => setParams(p)}
              count={itemCount}
            />
          </div>
        </section>

        <AlertList alerts={alerts} closeAlert={() => closeAlert()} />
      </Modal>
    </>
  );
};
