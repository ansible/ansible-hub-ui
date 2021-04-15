import * as React from 'react';
import { UserType, FeatureFlagsType } from 'src/api';

interface IAppContextType {
  user: UserType;
  setUser: (user: UserType) => void;
  selectedRepo?: string;
  setRepo: (repo: string) => void;
  featureFlags: FeatureFlagsType;
}

export const AppContext = React.createContext<IAppContextType>(undefined);
