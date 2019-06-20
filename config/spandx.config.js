/*global module, process*/

// This is a sample configuration for running the starter app locally.

// Hack so that Mac OSX docker can sub in host.docker.internal instead of localhost
// see https://docs.docker.com/docker-for-mac/networking/#i-want-to-connect-from-a-container-to-a-service-on-the-host
const localhost = (process.env.PLATFORM === 'linux') ? 'localhost' : 'host.docker.internal';

module.exports = {
    routes: {
        '/apps/automation-hub': { host: `https://${localhost}:8002` },
        '/insights/automation-hub': { host: `https://${localhost}:8002` }
    }
};
