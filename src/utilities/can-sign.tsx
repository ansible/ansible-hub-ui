import { IAppContextType } from '../loaders/app-context';

export const canSign = (context: IAppContextType) =>
  context.featureFlags.collection_signing &&
  context.user.model_permissions.sign_collections_on_namespace;
