// Fool TypeScript into thinking that we actually have typings for these components.
// This will tell typescript that anything from this module is of type any.

declare module 'react-router-hash-link';
declare module '*.svg';

// Declare configuration globals here so that TypeScript compiles
/* eslint-disable no-var */
declare var API_HOST;
declare var API_BASE_PATH;
declare var UI_BASE_PATH;
declare var DEPLOYMENT_MODE;
declare var NAMESPACE_TERM;
declare var APPLICATION_NAME;
declare var UI_EXTERNAL_LOGIN_URI;

// when DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE only
interface Window {
  insights: {
    chrome: {
      auth: {
        doOffline: () => void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getOfflineToken: () => Promise<{ data: any }>;
        getUser: () => Promise<{ identity: object }>;
      };
      identifyApp: (s: string) => void;
      init: () => void;
      on: (s: string, f: function) => void;
    };
  };
}
