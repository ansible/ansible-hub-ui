import * as React from 'react';
import { UserType } from 'src/api';

interface IAppContextType {
  user: UserType;
  setUser: (user: UserType) => void;
  selectedRepo?: string;
  setRepo: (repo: string) => void;
}

export const AppContext = React.createContext<IAppContextType>(undefined);
