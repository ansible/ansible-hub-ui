const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');
const TSOverrides = require('./webpack-ts-overrides');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

// NOTE: This file is not meant to be consumed directly by weback. Instead it
// should be imported, initialized with the following settings and exported like
// a normal webpack config. See config/insights.prod.webpack.config.js for an
// example

// Default user defined settings
const defaultConfigs = [
  // Global scope means that the variable will be available to the app itself
  // as a constant after it is compiled
  { name: 'API_HOST', default: '', scope: 'global' },
  { name: 'API_BASE_PATH', default: '', scope: 'global' },
  { name: 'UI_BASE_PATH', default: '', scope: 'global' },
  { name: 'DEPLOYMENT_MODE', default: 'standalone', scope: 'global' },
  { name: 'NAMESPACE_TERM', default: 'namespaces', scope: 'global' },
  { name: 'APPLICATION_NAME', default: 'Galaxy NG', scope: 'global' },
  { name: 'UI_EXTERNAL_LOGIN_URI', default: '/login', scope: 'global' },

  // Webpack scope means the variable will only be available to webpack at
  // build time
  { name: 'UI_USE_HTTPS', default: false, scope: 'webpack' },
  { name: 'UI_DEBUG', default: false, scope: 'webpack' },
  { name: 'TARGET_ENVIRONMENT', default: 'prod', scope: 'webpack' },
  { name: 'UI_PORT', default: 8002, scope: 'webpack' },
  { name: 'WEBPACK_PROXY', default: undefined, scope: 'webpack' },
  { name: 'WEBPACK_PUBLIC_PATH', default: undefined, scope: 'webpack' },
  { name: 'USE_FAVICON', default: true, scope: 'webpack' },
];

module.exports = (inputConfigs) => {
  const customConfigs = {};
  const globals = {};

  defaultConfigs.forEach((item, i) => {
    // == will match null and undefined, but not false
    if (inputConfigs[item.name] == null) {
      customConfigs[item.name] = item.default;
    } else {
      customConfigs[item.name] = inputConfigs[item.name];
    }
    if (item.scope === 'global') {
      globals[item.name] = JSON.stringify(
        inputConfigs[item.name] || item.default,
      );
    }
  });

  const htmlPluginConfig = {
    targetEnv: customConfigs.DEPLOYMENT_MODE,
    applicationName: customConfigs.APPLICATION_NAME,
  };

  // being able to turn off the favicon is useful for deploying to insights mode
  // console.redhat.com sets its own favicon and ours tends to override it if we
  // set one
  if (customConfigs.USE_FAVICON) {
    htmlPluginConfig['favicon'] = 'static/images/favicon.ico';
  }

  const { config: webpackConfig, plugins } = config({
    rootFolder: resolve(__dirname, '../'),
    htmlPlugin: htmlPluginConfig,
    debug: customConfigs.UI_DEBUG,
    https: customConfigs.UI_USE_HTTPS,

    // defines port for dev server
    port: customConfigs.UI_PORT,
  });

  // Override sections of the webpack config to work with TypeScript
  const newWebpackConfig = {
    ...webpackConfig,
    ...TSOverrides,
  };

  if (customConfigs.WEBPACK_PROXY) {
    newWebpackConfig.devServer.proxy = customConfigs.WEBPACK_PROXY;
  }

  if (customConfigs.WEBPACK_PUBLIC_PATH) {
    console.log(`New output.publicPath: ${customConfigs.WEBPACK_PUBLIC_PATH}`);
    newWebpackConfig.output.publicPath = customConfigs.WEBPACK_PUBLIC_PATH;
  }

  if (customConfigs.DEPLOYMENT_MODE === 'standalone') {
    console.log('Overriding configs for standalone mode.');

    const newEntry = resolve(__dirname, '../src/entry-standalone.tsx');
    console.log(`New entry.App: ${newEntry}`);
    newWebpackConfig.entry.App = newEntry;
  }

  plugins.push(new webpack.DefinePlugin(globals));
  plugins.push(new ForkTsCheckerWebpackPlugin());

  return {
    ...newWebpackConfig,
    plugins,
  };
};
