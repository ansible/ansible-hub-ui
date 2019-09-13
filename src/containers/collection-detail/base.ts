import { CollectionDetailType, CollectionAPI } from '../../api';

export interface IBaseCollectionState {
    params: {
        version?: string;
        showing?: string;
        keywords?: string;
    };
    collection: CollectionDetailType;
}

export function loadCollection() {
    CollectionAPI.getCached(
        this.props.match.params['namespace'],
        this.props.match.params['collection'],
    ).then(result => {
        this.setState({ collection: result });
    });
}
