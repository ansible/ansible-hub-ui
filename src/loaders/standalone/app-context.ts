import * as React from 'react';
import { MeType, UserType } from '../../api';

interface IAppContextType {
  user: UserType;
  activeUser: MeType;
  setUser: (user: UserType) => void;
  setActiveUser: (activeUser: MeType) => void;
}

export const AppContext = React.createContext<IAppContextType>(undefined);
