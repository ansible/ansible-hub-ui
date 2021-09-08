const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { resolve } = require('path');
const isBuild = process.env.NODE_ENV === 'production';

module.exports = {
  devtool: 'source-map',
  module: {
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
    // changed from extensions: [".js", ".jsx"]
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    // imports relative to repo root
    alias: {
      src: resolve(__dirname, '../src'),
    },
  },
  watchOptions: {
    ignored: ['**/.*.sw[po]'],
  },
};
