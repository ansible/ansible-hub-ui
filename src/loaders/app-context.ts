import * as React from 'react';
import { FeatureFlagsType, SettingsType, UserType } from 'src/api';
import { AlertType } from 'src/components';

export interface IAppContextType {
  user?: UserType;
  setUser: (user: UserType) => void;
  selectedRepo?: string;
  featureFlags: FeatureFlagsType;
  alerts: AlertType[];
  setAlerts: (alerts: AlertType[]) => void;
  queueAlert: (alert: AlertType) => void;
  settings: SettingsType;
  hasPermission: (name: string) => boolean;
}

export const AppContext = React.createContext<IAppContextType>(undefined);
export const useContext = () => React.useContext(AppContext);
