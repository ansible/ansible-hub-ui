import { t } from '@lingui/macro';
import { Button, Modal, Spinner } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import {
  AnsibleRepositoryType,
  CollectionVersion,
  CollectionVersionAPI,
  Repositories,
  SigningServiceAPI,
} from 'src/api';
import {
  AlertList,
  AlertType,
  MultipleRepoSelector,
  closeAlert,
} from 'src/components';
import { useContext } from 'src/loaders/app-context';
import {
  errorMessage,
  parsePulpIDFromURL,
  waitForTaskUrl,
} from 'src/utilities';

interface IProps {
  closeAction: () => void;
  collectionVersion: CollectionVersion;
  addAlert: (alert) => void;
  allRepositories: AnsibleRepositoryType[];
  finishAction: () => void;
  stagingRepoNames: string[];
  rejectedRepoName: string;
}

export const ApproveModal = (props: IProps) => {
  const [alerts, setAlerts] = useState([]);
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [fixedRepos, setFixedRepos] = useState([]);
  const [loading, setLoading] = useState(false);

  const context = useContext();

  function approve() {
    let error = '';

    async function approveAsync() {
      setLoading(true);

      let reapprove = false;

      let originRepoName = props.collectionVersion.repository_list.find(
        (repo) =>
          props.stagingRepoNames.includes(repo) ||
          repo == props.rejectedRepoName,
      );

      // origin repo is not staging or rejected, so this is reapprove process, user can add collection to approved repos
      if (!originRepoName) {
        reapprove = true;
        originRepoName = fixedRepos[0];
      }

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

      error = t`Repository name ${originRepoName} not found.`;
      const repoData = await Repositories.getRepository({
        name: originRepoName,
      });
      if (repoData.data.results.length == 0) {
        throw new Error();
      }
      error = '';

      const pulp_id = parsePulpIDFromURL(repoData.data.results[0].pulp_href);

      error = t`Collection with id ${props.collectionVersion.id} not found.`;
      const collectionData = await CollectionVersionAPI.get(
        props.collectionVersion.id,
      );
      error = '';

      const autosign = context.settings.GALAXY_AUTO_SIGN_COLLECTIONS;
      let signingService_href = null;

      if (autosign) {
        const signingServiceName =
          context.settings.GALAXY_COLLECTION_SIGNING_SERVICE;

        error = t`Signing service ${signingServiceName} not found`;
        const signingList = await SigningServiceAPI.list({
          name: signingServiceName,
        });
        if (signingList.data.results.length > 0) {
          signingService_href = signingList.data.results[0].pulp_href;
        } else {
          throw new Error();
        }
        error = '';
      }

      let promiseCopyOrMove = null;
      if (reapprove) {
        // reapprove takes first
        promiseCopyOrMove = Repositories.copyCollectionVersion(
          pulp_id,
          [collectionData.data.pulp_href],
          repositoriesRef,
          signingService_href,
        );
      } else {
        promiseCopyOrMove = Repositories.moveCollectionVersion(
          pulp_id,
          [collectionData.data.pulp_href],
          repositoriesRef,
          signingService_href,
        );
      }

      const task = await promiseCopyOrMove;
      await waitForTaskUrl(task['data'].task);

      setLoading(false);
      props.finishAction();
      props.addAlert({
        title: t`Certification status for collection "${props.collectionVersion.namespace} ${props.collectionVersion.name} v${props.collectionVersion.version}" has been successfully updated.`,
        variant: 'success',
        description: '',
      });
    }

    approveAsync().catch(() => {
      setLoading(false);

      addAlert({
        title: t`Failed to approve collection.`,
        variant: 'danger',
        description: error,
      });
    });
  }

  function addAlert(alert: AlertType) {
    setAlerts((prevAlerts) => [...prevAlerts, alert]);
  }

  function loadRepos(params, setRepositoryList, setLoading, setItemsCount) {
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
          <MultipleRepoSelector
            allRepositories={props.allRepositories}
            fixedRepos={fixedRepos}
            selectedRepos={selectedRepos}
            setSelectedRepos={setSelectedRepos}
            loadRepos={loadRepos}
          />
          {loading && <Spinner />}
        </section>

        <AlertList
          alerts={alerts}
          closeAlert={(i) => closeAlert(i, { alerts, setAlerts })}
        />
      </Modal>
    </>
  );
};
