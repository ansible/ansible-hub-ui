import { CollectionDetailType, CollectionAPI } from '../../api';
import { Paths } from '../../paths';
import { Constants } from '../../constants';

export interface IBaseCollectionState {
  params: {
    version?: string;
    showing?: string;
    keywords?: string;
  };
  collection: CollectionDetailType;
}

export function loadCollection(
  repo,
  forceReload = false,
  callback = () => null,
) {
  CollectionAPI.getCached(
    this.props.match.params['namespace'],
    this.props.match.params['collection'],
    Constants.REPOSITORYNAMES[repo],
    this.state.params,
    forceReload,
  )
    .then(result => {
      this.setState({ collection: result }, callback);
    })
    .catch(result => {
      this.props.history.push(Paths.notFound);
    });
}
