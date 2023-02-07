import { t } from '@lingui/macro';
import { Spinner } from '@patternfly/react-core';
import * as React from 'react';
import { CollectionAPI, CollectionExcludesType } from 'src/api';
import { AlertType } from 'src/components';
import { errorMessage } from 'src/utilities';

interface IProps {
  distributionPath: string;
}
interface IState {
  collectionCount: number;
  alerts: AlertType[];
  loading: boolean;
}

export class CollectionCount extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      collectionCount: null,
      alerts: [],
      loading: true,
    };
  }

  componentDidMount() {
    this.getCollectionCount(this.props.distributionPath);
  }

  render() {
    const { collectionCount, loading } = this.state;
    return !loading ? <>{collectionCount}</> : <Spinner size='sm' />;
  }

  private getCollectionCount(repo) {
    const { distributionPath } = this.props;
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
        this.setState({ collectionCount: count, loading: false });
      })
      .catch((err) => {
        this.setState({ loading: false });
        const { status, statusText } = err.response;
        this.addAlert(
          t`Collection count for "${distributionPath}" could not be displayed.`,
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
