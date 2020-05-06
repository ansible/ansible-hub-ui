const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const custom = require('../config/webpack-ts-overrides');

module.exports = {
  stories: ['../src/**/*.stories.tsx'],
  webpackFinal: config => {
    config.module = custom.module;
    config.plugins.push(
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css',
        ignoreOrder: false,
      }),
    );

    config.resolve.extensions.push('.ts', '.tsx');
    return config;
  },
};
