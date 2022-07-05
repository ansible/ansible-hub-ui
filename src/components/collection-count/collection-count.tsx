import * as React from 'react';
import { t } from '@lingui/macro';
import { CollectionAPI, CollectionExcludesType } from 'src/api';
import { Spinner } from '@patternfly/react-core';
import { AlertType } from 'src/components';
import { errorMessage } from 'src/utilities';

interface IProps {
  repositoryPath: string;
}
interface IState {
  collectionCount: string;
  alerts: AlertType[];
  loading: boolean;
}

export class CollectionCount extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      collectionCount: '',
      alerts: [],
      loading: true,
    };
  }

  componentDidMount() {
    this.getCollectionCount(this.props.repositoryPath);
  }

  render() {
    const { collectionCount, loading } = this.state;
    return collectionCount && !loading ? (
      <td>{collectionCount}</td>
    ) : !collectionCount && loading ? (
      <Spinner />
    ) : (
      <td></td>
    );
  }

  private getCollectionCount(repo) {
    const { repositoryPath } = this.props;
    const promises = [];
    promises.push(
      CollectionAPI.getPublishedCount(repo).then((count) => {
        return count;
      }),
    );

    promises.push(
      CollectionAPI.getExcludesCount(repo).then(
        (results: CollectionExcludesType) => {
          const excludedCollections = results.collections;
          const count = excludedCollections.length;
          return count;
        },
      ),
    );

    Promise.all(promises)
      .then((results) => {
        const count = results[0] - results[1];
        this.setState({ collectionCount: count.toString(), loading: false });
      })
      .catch((err) => {
        this.setState({ loading: false });
        const { status, statusText } = err.response;
        this.addAlert(
          t`Collection count for "${repositoryPath}" could not be displayed.`,
          'danger',
          errorMessage(status, statusText),
        );
      });
  }

  private addAlert(title, variant, description?) {
    this.setState({
      alerts: [
        ...this.state.alerts,
        {
          description,
          title,
          variant,
        },
      ],
    });
  }
}
