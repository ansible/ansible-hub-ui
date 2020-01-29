/* global require, module, __dirname */
const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');
const commonWPconfig = require('./common.webpack.js');
const TSOverrides = require('./webpack-ts-overrides');
const path = require('path');

// targetEnv determines whether the app is compiled to run on the insights
// platform or a standalone platform.
module.exports = (targetEnv = 'insights') => {
    const { config: webpackConfig, plugins } = config({
        rootFolder: resolve(__dirname, '../'),
        debug: true,
        https: true,
        htmlPlugin: { targetEnv: targetEnv },
    });

    webpackConfig.serve = {
        content: commonWPconfig.paths.public,
        port: 8002,
        dev: {
            publicPath: commonWPconfig.paths.publicPath,
        },
        // https://github.com/webpack-contrib/webpack-serve/blob/master/docs/addons/history-fallback.config.js
        add: app => app.use(convert(history({}))),
    };

    // Override sections of the webpack config to work with TypeScript
    const newWebpackConfig = {
        ...webpackConfig,
        ...TSOverrides,
    };

    if (targetEnv === 'standalone') {
        console.log('Overriding app entry for standalone mode.')

        const newEntry = path.resolve(__dirname, '../src/entry-standalone.js')
        console.log(`New entry: ${newEntry}`)

        newWebpackConfig.entry.App = newEntry;
    }

    return {
        ...newWebpackConfig,
        plugins,
    };
};
