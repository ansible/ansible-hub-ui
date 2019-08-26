/*global module*/

const SECTION = 'ansible';
const APP_ID = 'automation-hub';
const FRONTEND_PORT = 8002;
const API_PORT = 8888;
const routes = {};

// Hosts need to use https on macs. Not sure why.
routes[`/beta/${SECTION}/${APP_ID}`] = { host: `https://localhost:${FRONTEND_PORT}` };
routes[`/${SECTION}/${APP_ID}`]      = { host: `https://localhost:${FRONTEND_PORT}` };
routes[`/beta/apps/${APP_ID}`]       = { host: `https://localhost:${FRONTEND_PORT}` };
routes[`/apps/${APP_ID}`]            = { host: `https://localhost:${FRONTEND_PORT}` };

routes[`/api/${APP_ID}`] = { host: `https://localhost:${API_PORT}` };

module.exports = { routes };
