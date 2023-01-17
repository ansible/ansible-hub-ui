import {
  ActiveUserAPI,
  FeatureFlagsAPI,
  FeatureFlagsType,
  SettingsAPI,
  UserType,
  SettingsType,
} from 'src/api';
import { AlertType } from 'src/components';

type ContextFragment = {
  alerts: AlertType[];
  featureFlags: FeatureFlagsType;
  settings?: SettingsType;
  user?: UserType;
};

export function loadContext(): Promise<ContextFragment> {
  const getFeatureFlags = FeatureFlagsAPI.get().then(
    ({ data: featureFlags }) => ({
      alerts: (featureFlags._messages || []).map((msg) => ({
        variant: 'warning',
        title: msg.split(':')[1],
      })),
      featureFlags,
    }),
  );

  return Promise.all([
    ActiveUserAPI.getUser(),
    SettingsAPI.get(),
    getFeatureFlags,
  ])
    .then(([user, { data: settings }, { alerts, featureFlags }]) => ({
      alerts,
      featureFlags,
      settings,
      user,
    }))
    .catch(() => {
      // we need this even if ActiveUserAPI fails, otherwise isExternalAuth will always be false, breaking keycloak redirect
      return getFeatureFlags.then(({ alerts, featureFlags }) => ({
        alerts,
        featureFlags,
      }));
    });
}
