/*global module*/

const SECTION = 'ansible';
const APP_ID = 'automation-hub';
const FRONTEND_PORT = 8002;
const API_PORT = 5001;
const routes = {};

const localhost = (process.env.PLATFORM === 'linux') ? 'localhost' : 'host.docker.internal';

// Hosts need to use https on macs. Not sure why.
routes[`/beta/${SECTION}/${APP_ID}`] = { host: `https://${localhost}:${FRONTEND_PORT}` };
routes[`/${SECTION}/${APP_ID}`]      = { host: `https://${localhost}:${FRONTEND_PORT}` };
routes[`/beta/apps/${APP_ID}`]       = { host: `https://${localhost}:${FRONTEND_PORT}` };
routes[`/apps/${APP_ID}`]            = { host: `https://${localhost}:${FRONTEND_PORT}` };

routes[`/api/automation-hub/`]       = { host: `http://${localhost}:${API_PORT}` };
routes[`/static/`]       = { host: `http://${localhost}:${API_PORT}` };

module.exports = { routes };
