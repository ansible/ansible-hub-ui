const { resolve } = require('node:path');
const config = require('@redhat-cloud-services/frontend-components-config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const { execSync } = require('node:child_process');

const isBuild = process.env.NODE_ENV === 'production';

// NOTE: This file is not meant to be consumed directly by weback. Instead it
// should be imported, initialized with the following settings and exported like
// a normal webpack config. See config/standalone.dev.webpack.config.js for an
// example

// only run git when HUB_UI_VERSION is NOT provided
const gitCommit =
  process.env.HUB_UI_VERSION ||
  execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();

const docsURL =
  'https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/';

// Default user defined settings
const defaultConfigs = [
  // Global scope means that the variable will be available to the app itself
  // as a constant after it is compiled
  { name: 'API_BASE_PATH', default: '', scope: 'global' },
  { name: 'API_HOST', default: '', scope: 'global' },
  { name: 'APPLICATION_NAME', default: 'Galaxy NG', scope: 'global' },
  { name: 'UI_BASE_PATH', default: '', scope: 'global' },
  { name: 'UI_COMMIT_HASH', default: gitCommit, scope: 'global' },
  { name: 'UI_DOCS_URL', default: docsURL, scope: 'global' },
  { name: 'UI_EXTERNAL_LOGIN_URI', default: '/login', scope: 'global' },

  // Webpack scope: only available in customConfigs here, not exposed to the UI
  { name: 'API_PROXY_TARGET', default: undefined, scope: 'webpack' },
  { name: 'UI_DEBUG', default: false, scope: 'webpack' },
  { name: 'UI_PORT', default: 8002, scope: 'webpack' },
  { name: 'UI_USE_HTTPS', default: false, scope: 'webpack' },
  { name: 'WEBPACK_PROXY', default: undefined, scope: 'webpack' },
  { name: 'WEBPACK_PUBLIC_PATH', default: undefined, scope: 'webpack' },
];

module.exports = (inputConfigs) => {
  const customConfigs = {};
  const globals = {};

  defaultConfigs.forEach((item) => {
    customConfigs[item.name] = inputConfigs[item.name] ?? item.default;
  });

  defaultConfigs
    .filter(({ scope }) => scope === 'global')
    .forEach((item) => {
      globals[item.name] = JSON.stringify(customConfigs[item.name]);
    });

  // 4.6+: pulp APIs live under API_BASE_PATH now, ignore previous overrides
  globals.PULP_API_BASE_PATH = JSON.stringify(
    customConfigs.API_BASE_PATH + 'pulp/api/v3/',
  );

  const rootFolder = resolve(__dirname, '../');
  const appEntry = resolve(rootFolder, 'src', 'entry-standalone.tsx');

  const { config: webpackConfig, plugins } = config({
    appEntry,
    rootFolder,
    definePlugin: globals,
    debug: customConfigs.UI_DEBUG,
    https: customConfigs.UI_USE_HTTPS,

    // defines port for dev server
    port: customConfigs.UI_PORT,

    // frontend-components-config 4.5.0+: don't remove patternfly
    bundlePfModules: true,

    // frontend-components-config 4.6.25-29+: ensure hashed filenames
    useFileHash: true,
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
        static: resolve(__dirname, '../static'),
      },
    },
    watchOptions: {
      // ignore editor files when watching
      ignored: ['**/.*.sw[po]'],
    },
  };

  if (customConfigs.WEBPACK_PROXY) {
    // array since webpack-dev-server 5
    newWebpackConfig.devServer.proxy = Object.entries(
      customConfigs.WEBPACK_PROXY,
    ).map(([k, v]) => ({
      context: [k],
      target: v,
    }));
  }

  if (customConfigs.WEBPACK_PUBLIC_PATH) {
    newWebpackConfig.output.publicPath = customConfigs.WEBPACK_PUBLIC_PATH;
  }

  // ForkTsCheckerWebpackPlugin is part of default config since @redhat-cloud-services/frontend-components-config 4.6.24

  // keep HtmlWebpackPlugin for standalone, inject src/index.html
  plugins.push(
    new HtmlWebpackPlugin({
      applicationName: customConfigs.APPLICATION_NAME,
      favicon: 'static/images/favicon.ico',
      template: resolve(__dirname, '../src/index.html'),
    }),
  );

  // @patternfly/react-code-editor
  plugins.push(
    new MonacoWebpackPlugin({
      languages: ['yaml'],
    }),
  );

  // webpack-dev-server 5
  if (!isBuild && newWebpackConfig.devServer.onBeforeSetupMiddleware) {
    const orig = newWebpackConfig.devServer.onBeforeSetupMiddleware;
    delete newWebpackConfig.devServer.onBeforeSetupMiddleware;
    delete newWebpackConfig.devServer.https;

    newWebpackConfig.devServer.setupMiddlewares = (middlewares, app) => {
      orig(app);
      return middlewares;
    };
  }

  return {
    ...newWebpackConfig,
    plugins,
  };
};
