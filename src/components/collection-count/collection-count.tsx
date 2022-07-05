import * as React from 'react';
import { CollectionAPI, CollectionExcludesType } from 'src/api';
import { Spinner } from '@patternfly/react-core';

interface IProps {
  repositoryPath: string;
}
interface IState {
  collectionCount: string;
}

export class CollectionCount extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      collectionCount: '',
    };
  }

  componentDidMount() {
    this.getCollectionCount(this.props.repositoryPath).then((count) => {
      this.setState({ collectionCount: count });
    });
  }

  render() {
    const { collectionCount } = this.state;

    return !collectionCount ? <Spinner /> : <td>{collectionCount}</td>;
  }

  private getCollectionCount(repo) {
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

    Promise.all(promises).then((results) => {
      const count = results[0] - results[1];
      return count;
    });
  }
}
