// Fool TypeScript into thinking that we actually have typings for these components.
// This will tell typescript that anything from this module is of type any.

declare module '*.svg';

// Declare configuration globals here so that TypeScript compiles
/* eslint-disable no-var */
declare var API_BASE_PATH;
declare var API_HOST;
declare var APPLICATION_NAME;
declare var DEPLOYMENT_MODE;
declare var NAMESPACE_TERM;
declare var PULP_API_BASE_PATH;
declare var UI_BASE_PATH;
declare var UI_COMMIT_HASH;
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
            internal: {
              account_id: number;
              org_id: string;
            };
            org_id: string;
            type?: string;
            user: {
              email: string;
              first_name: string;
              is_active?: boolean;
              is_internal: boolean;
              is_org_admin: boolean;
              last_name: string;
              locale?: string;
              username: string;
            };
          };
        }>;
      };
      identifyApp: (s: string, title?: string) => void;
      init: () => void;
      on: (s: string, f: (event) => void) => () => void;
    };
  };
}
