import { FeatureFlagsType, SettingsType, UserType } from 'src/api';

export type PermissionContextType = (o: {
  featureFlags: FeatureFlagsType;
  settings: SettingsType;
  user: UserType;
  hasPermission: (string) => boolean;
}) => boolean;

export const isLoggedIn: PermissionContextType = ({ user }) =>
  user && !user.is_anonymous;
