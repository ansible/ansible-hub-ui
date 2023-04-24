const { resolve } = require('path'); // node:path
const config = require('@redhat-cloud-services/frontend-components-config');
const {
  rbac,
  defaultServices,
} = require('@redhat-cloud-services/frontend-components-config-utilities/standalone');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const { execSync } = require('child_process'); // node:child_process

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
  { name: 'UI_COMMIT_HASH', default: gitCommit, scope: 'global' },

  // Webpack scope means the variable will only be available to webpack at
  // build time
  { name: 'UI_USE_HTTPS', default: false, scope: 'webpack' },
  { name: 'UI_DEBUG', default: false, scope: 'webpack' },
  { name: 'UI_PORT', default: 8002, scope: 'webpack' },
  { name: 'WEBPACK_PROXY', default: undefined, scope: 'webpack' },
  { name: 'WEBPACK_PUBLIC_PATH', default: undefined, scope: 'webpack' },
  { name: 'API_PROXY_TARGET', default: undefined, scope: 'webpack' },
];

const insightsMockAPIs = ({ app }) => {
  // GET
  [
    {
      url: '/api/chrome-service/v1/user',
      response: {
        data: {
          lastVisited: [],
          favoritePages: [],
          visitedBundles: {},
        },
      },
    },
    { url: '/api/featureflags/v0', response: { toggles: [] } },
    { url: '/api/quickstarts/v1/progress', response: { data: [] } },
    { url: '/api/rbac/v1/access', response: { data: [] } },
    { url: '/api/rbac/v1/cross-account-requests', response: { data: [] } },
  ].forEach(({ url, response }) =>
    app.get(url, (_req, res) => res.send(response)),
  );

  // POST
  [
    { url: '/api/chrome-service/v1/last-visited', response: { data: [] } },
    {
      url: '/api/chrome-service/v1/user/visited-bundles',
      response: { data: [] },
    },
    { url: '/api/featureflags/v0/client/metrics', response: {} },
  ].forEach(({ url, response }) =>
    app.post(url, (_req, res) => res.send(response)),
  );
};

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

  // 4.6+: pulp APIs live under API_BASE_PATH now, ignore previous overrides
  globals.PULP_API_BASE_PATH = JSON.stringify(
    customConfigs.API_BASE_PATH + 'pulp/api/v3/',
  );

  const isStandalone = customConfigs.DEPLOYMENT_MODE !== 'insights';

  const { config: webpackConfig, plugins } = config({
    rootFolder: resolve(__dirname, '../'),
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
        registry: [insightsMockAPIs],
      }),

    // insights deployments from master
    ...(!isStandalone &&
      cloudBeta && {
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

  if (customConfigs.DEPLOYMENT_MODE === 'standalone') {
    console.log('Overriding configs for standalone mode.');

    const newEntry = resolve(__dirname, '../src/entry-standalone.tsx');
    console.log(`New entry.App: ${newEntry}`);
    newWebpackConfig.entry.App = newEntry;
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

  if (customConfigs.DEPLOYMENT_MODE === 'insights') {
    /**
     * Generates remote containers for chrome 2
     */
    plugins.push(
      require('@redhat-cloud-services/frontend-components-config/federated-modules')(
        {
          root: resolve(__dirname, '../'),
          exposes: {
            './RootApp': resolve(__dirname, '../src/entry-insights.tsx'),
          },
          shared: [
            {
              'react-router-dom': { singleton: true, requiredVersion: '*' },
            },
          ],
          ...(!isBuild && {
            // fixes "Shared module is not available for eager consumption"
            exclude: ['@patternfly/react-core'],
          }),
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

  return {
    ...newWebpackConfig,
    plugins,
  };
};
