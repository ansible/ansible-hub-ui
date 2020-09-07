import * as React from 'react';
import { UserType } from '../api';

interface IAppContextType {
  user: UserType;
  setUser: (user: UserType) => void;
  selectedRepo?: string;
}

export const AppContext = React.createContext<IAppContextType>(undefined);
