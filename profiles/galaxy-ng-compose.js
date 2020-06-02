/*global module*/

const SECTION = 'ansible';
const APP_ID = 'automation-hub';
const FRONTEND_PORT = 8002;
const API_PORT = 8000;
const routes = {};

const uiHost = 'ui';
const apiHost = 'api';

// Hosts need to use https on macs. Not sure why.
routes[`/beta/${SECTION}/${APP_ID}`] = {
  host: `https://${uiHost}:${FRONTEND_PORT}`,
};
routes[`/${SECTION}/${APP_ID}`] = {
  host: `https://${uiHost}:${FRONTEND_PORT}`,
};
routes[`/beta/apps/${APP_ID}`] = { host: `https://${uiHost}:${FRONTEND_PORT}` };
routes[`/apps/${APP_ID}`] = { host: `https://${uiHost}:${FRONTEND_PORT}` };

routes[`/api/automation-hub/`] = { host: `http://${apiHost}:${API_PORT}` };
routes[`/static/`] = { host: `http://${apiHost}:${API_PORT}` };

module.exports = { routes };
