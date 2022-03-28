import { IAppContextType } from '../loaders/app-context';

export const canSign = (context: IAppContextType) =>
  context.featureFlags.collection_signing;
