const { resolve } = require('node:path');
const config = require('@redhat-cloud-services/frontend-components-config');
const {
  default: { rbac, defaultServices },
} = require('@redhat-cloud-services/frontend-components-config-utilities/standalone/services');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const { execSync } = require('node:child_process');

const isBuild = process.env.NODE_ENV === 'production';
const cloudBeta = process.env.HUB_CLOUD_BETA; // "true" | "false" | undefined (=default)

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
  { name: 'IS_COMMUNITY', default: false, scope: 'global' },
  { name: 'IS_INSIGHTS', default: false, scope: 'global' },
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

  // community is also considered standalone
  const isStandalone = !customConfigs.IS_INSIGHTS;

  const rootFolder = resolve(__dirname, '../');
  const appEntry = resolve(
    rootFolder,
    'src',
    isStandalone ? 'entry-standalone.tsx' : 'entry-insights.tsx',
  );

  const { config: webpackConfig, plugins } = config({
    appEntry,
    rootFolder,
    definePlugin: globals,
    debug: customConfigs.UI_DEBUG,
    https: customConfigs.UI_USE_HTTPS,

    // defines port for dev server
    port: customConfigs.UI_PORT,

    // frontend-components-config 4.5.0+: don't remove patternfly from non-insights builds
    bundlePfModules: isStandalone,

    // frontend-components-config 4.6.25-29+: ensure hashed filenames
    useFileHash: true,

    // insights dev
    ...(!isStandalone &&
      !isBuild && {
        appUrl: customConfigs.UI_BASE_PATH.includes('/preview/')
          ? [
              customConfigs.UI_BASE_PATH,
              customConfigs.UI_BASE_PATH.replace('/preview/', '/beta/'),
            ]
          : customConfigs.UI_BASE_PATH,
        deployment: cloudBeta !== 'false' ? 'beta/apps' : 'apps',
        standalone: {
          api: {
            context: [customConfigs.API_BASE_PATH],
            target: customConfigs.API_PROXY_TARGET,
          },
          rbac,
          ...defaultServices,
        },
      }),

    // insights deployments from master
    ...(!isStandalone &&
      isBuild && {
        deployment: cloudBeta === 'true' ? 'beta/apps' : 'apps',
      }),
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
  if (isStandalone) {
    plugins.push(
      new HtmlWebpackPlugin({
        applicationName: customConfigs.APPLICATION_NAME,
        favicon: 'static/images/favicon.ico',
        template: resolve(__dirname, '../src/index.html'),
      }),
    );
  }

  if (customConfigs.IS_INSIGHTS) {
    // insights federated modules
    // FIXME: still needed?
    plugins.push(
      require('@redhat-cloud-services/frontend-components-config-utilities/federated-modules')(
        {
          root: rootFolder,
          exposes: {
            './RootApp': appEntry,
          },
          shared: [
            {
              'react-router-dom': { singleton: true, version: '*' },
            },
          ],
        },
      ),
    );
  }

  // @patternfly/react-code-editor
  plugins.push(
    new MonacoWebpackPlugin({
      languages: ['yaml'],
    }),
  );

  // webpack-dev-server 5
  if (!isBuild && 'https' in newWebpackConfig.devServer) {
    delete newWebpackConfig.devServer.https;
  }

  return {
    ...newWebpackConfig,
    plugins,
  };
};
