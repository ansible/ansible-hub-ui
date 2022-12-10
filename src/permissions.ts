import { UserType, FeatureFlagsType, SettingsType } from 'src/api';

export type CanContext = (o: {
  featureFlags: FeatureFlagsType;
  settings: SettingsType;
  user: UserType;
}) => boolean;

export const isLoggedIn: CanContext = ({ user }) => user && !user.is_anonymous;
