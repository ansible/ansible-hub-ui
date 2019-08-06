/*global module*/

const SECTION = 'ansible';
const APP_ID = 'automation-hub';
const FRONTEND_PORT = 8002;
const API_PORT = 8000;
const routes = {};

const localhost = (process.env.PLATFORM === 'linux') ? 'localhost' : 'host.docker.internal';

// Hosts need to use https on macs. Not sure why.
routes[`/beta/${SECTION}/${APP_ID}`] = { host: `https://${localhost}:${FRONTEND_PORT}` };
routes[`/${SECTION}/${APP_ID}`]      = { host: `https://${localhost}:${FRONTEND_PORT}` };
routes[`/beta/apps/${APP_ID}`]       = { host: `https://${localhost}:${FRONTEND_PORT}` };
routes[`/apps/${APP_ID}`]            = { host: `https://${localhost}:${FRONTEND_PORT}` };

//todo: DON'T MERGE WITHOUT FIXING API PATHS
routes[`/api/v2`]       = { host: `http://${localhost}:${API_PORT}` };
routes[`/api/internal`]       = { host: `http://${localhost}:${API_PORT}` };


module.exports = { routes };
