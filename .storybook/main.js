const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const custom = require('../config/webpack-ts-overrides');
const webpack = require('webpack');

module.exports = {
  stories: ['../src/**/*.stories.tsx'],
  addons: ['@sambego/storybook-state'],
  webpackFinal: config => {
    config.module = custom.module;
    config.plugins.push(
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css',
        ignoreOrder: false,
      }),
    );

    config.plugins.push(
      new webpack.DefinePlugin({
        API_HOST: JSON.stringify(''),
        API_BASE_PATH: JSON.stringify(''),
        UI_BASE_PATH: JSON.stringify(''),
        DEPLOYMENT_MODE: JSON.stringify('standalone'),
      }),
    );

    config.resolve.extensions.push('.ts', '.tsx');
    return config;
  },
};
