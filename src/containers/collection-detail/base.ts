import { CollectionDetailType, CollectionAPI } from 'src/api';
import { AlertType } from 'src/components';
import { Paths } from 'src/paths';

export interface IBaseCollectionState {
  params: {
    version?: string;
    showing?: string;
    keywords?: string;
  };
  collection: CollectionDetailType;
  alerts?: AlertType[];
}

export function loadCollection(
  repo,
  forceReload = false,
  callback = () => null,
) {
  CollectionAPI.getCached(
    this.props.match.params['namespace'],
    this.props.match.params['collection'],
    repo,
    { ...this.state.params, include_related: 'my_permissions' },
    forceReload,
  )
    .then((result) => {
      return CollectionAPI.list(
        {
          name: this.props.match.params['collection'],
        },
        this.context.selectedRepo,
      ).then((collections) => {
        result.deprecated = collections.data.data[0].deprecated;
        this.setState({ collection: result }, callback);
      });
    })
    .catch(() => {
      this.props.history.push(Paths.notFound);
    });
}
