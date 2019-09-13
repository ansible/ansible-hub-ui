import { CollectionDetailType, CollectionAPI } from '../../api';

export interface IBaseCollectionState {
    params: {
        version?: string;
        showing?: string;
        keywords?: string;
    };
    collection: CollectionDetailType;
}

export function loadCollection(forceReload = false) {
    CollectionAPI.getCached(
        this.props.match.params['namespace'],
        this.props.match.params['collection'],
        this.state.params,
        forceReload,
    ).then(result => {
        this.setState({ collection: result });
    });
}
