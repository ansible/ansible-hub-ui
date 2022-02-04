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
        getOfflineToken: () => Promise<{
          data: {
            access_token: string;
            expires_in: number;
            id_token: string;
            refresh_expires_in: number;
            refresh_token: string;
            scope: string;
            session_state: string;
            token_type: string;
          };
        }>;
        getUser: () => Promise<{
          identity: {
            account_number: string;
            username: string;
            groups: { id: number; name: string }[];
          };
        }>;
      };
      identifyApp: (s: string) => void;
      init: () => void;
      on: (s: string, f: () => void) => void;
    };
  };
}
