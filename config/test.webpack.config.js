
/* global require, module, __dirname */
const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');
const { config: webpackConfig, plugins } = config({
    rootFolder: resolve(__dirname, '../')
});

// Override sections of the webpack config to work with TypeScript
const newWebpackConfig = {
    ...webpackConfig,
    ...TSOverrides,
};

module.exports = {
    ...newWebpackConfig,
    plugins
};
