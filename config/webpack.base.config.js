const { resolve } = require('path'); // node:path
const config = require('@redhat-cloud-services/frontend-components-config');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { execSync } = require('child_process'); // node:child_process

const isBuild = process.env.NODE_ENV === 'production';

// NOTE: This file is not meant to be consumed directly by weback. Instead it
// should be imported, initialized with the following settings and exported like
// a normal webpack config. See config/standalone.dev.webpack.config.js for an
// example

// hardcoded to 4.2 instead of running git when HUB_UI_VERSION is not provided
const gitCommit = process.env.HUB_UI_VERSION || '4.2';

// Default user defined settings
const defaultConfigs = [
  // Global scope means that the variable will be available to the app itself
  // as a constant after it is compiled
  { name: 'API_HOST', default: '', scope: 'global' },
  { name: 'API_BASE_PATH', default: '', scope: 'global' },
  { name: 'UI_BASE_PATH', default: '', scope: 'global' },
  { name: 'APPLICATION_NAME', default: 'Galaxy NG', scope: 'global' },

  // Webpack scope means the variable will only be available to webpack at
  // build time
  { name: 'UI_USE_HTTPS', default: false, scope: 'webpack' },
  { name: 'UI_DEBUG', default: false, scope: 'webpack' },
  { name: 'UI_PORT', default: 8002, scope: 'webpack' },
  { name: 'WEBPACK_PROXY', default: undefined, scope: 'webpack' },
  { name: 'WEBPACK_PUBLIC_PATH', default: undefined, scope: 'webpack' },
];

module.exports = (inputConfigs) => {
  const customConfigs = {};
  const globals = {};

  defaultConfigs.forEach((item) => {
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

  // config for HtmlWebpackPlugin
  const htmlPluginConfig = {
    // used by src/index.html
    applicationName: customConfigs.APPLICATION_NAME,

    favicon: 'static/images/favicon.ico',

    // standalone needs injecting js and css into dist/index.html
    inject: true,
  };

  const { config: webpackConfig, plugins } = config({
    rootFolder: resolve(__dirname, '../'),
    definePlugin: globals,
    htmlPlugin: htmlPluginConfig,
    debug: customConfigs.UI_DEBUG,
    https: customConfigs.UI_USE_HTTPS,
    // defines port for dev server
    port: customConfigs.UI_PORT,

    // frontend-components-config 4.5.0+: don't remove patternfly from builds
    bundlePfModules: true,

    // frontend-components-config 4.6.9+: keep HtmlWebpackPlugin for standalone
    useChromeTemplate: false,
  });

  // Override sections of the webpack config to work with TypeScript
  const newWebpackConfig = {
    ...webpackConfig,

    // override from empty
    devtool: 'source-map',

    module: {
      ...webpackConfig.module,

      // override to drop ts-loader
      rules: [
        {
          test: /src\/.*\.(js|jsx|ts|tsx)$/,
          use: [{ loader: 'source-map-loader' }, { loader: 'babel-loader' }],
        },
        {
          test: /\.(css|scss|sass)$/,
          use: [
            isBuild ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'sass-loader',
          ],
        },
        {
          test: /\.(woff(2)?|ttf|jpg|png|eot|gif|svg)(\?v=\d+\.\d+\.\d+)?$/,
          type: 'asset/resource',
          generator: { filename: 'fonts/[name][ext][query]' },
        },
      ],
    },

    resolve: {
      ...webpackConfig.resolve,

      // override to support jsx, drop scss
      extensions: ['.ts', '.tsx', '.js', '.jsx'],

      alias: {
        ...webpackConfig.resolve.alias,

        // imports relative to repo root
        src: resolve(__dirname, '../src'),
      },
    },

    // ignore editor files when watching
    watchOptions: {
      ignored: ['**/.*.sw[po]'],
    },
  };

  if (customConfigs.WEBPACK_PROXY) {
    newWebpackConfig.devServer.proxy = customConfigs.WEBPACK_PROXY;
  }

  if (customConfigs.WEBPACK_PUBLIC_PATH) {
    console.log(`New output.publicPath: ${customConfigs.WEBPACK_PUBLIC_PATH}`);
    newWebpackConfig.output.publicPath = customConfigs.WEBPACK_PUBLIC_PATH;
  }

  console.log('Overriding configs for standalone mode.');

  const newEntry = resolve(__dirname, '../src/entry-standalone.tsx');
  console.log(`New entry.App: ${newEntry}`);
  newWebpackConfig.entry.App = newEntry;

  plugins.push(new ForkTsCheckerWebpackPlugin());

  return {
    ...newWebpackConfig,
    plugins,
  };
};
