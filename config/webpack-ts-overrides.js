const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /src\/.*\.js$/,
        exclude: /(node_modules|bower_components)/i,
        use: [{ loader: 'source-map-loader' }, { loader: 'babel-loader' }],
      },
      {
        test: /\.s?[ac]ss$/,
        use: [
          process.env.NODE_ENV === 'production'
            ? 'style-loader'
            : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      {
        test: /\.(woff(2)?|ttf|jpg|png|eot|gif|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },

      // TypeScript configs
      // changed from { test: /\.jsx?$/, use: { loader: 'babel-loader' } },
      {
        test: /src\/.*\.(t|j)sx?$/,
        use: { loader: 'awesome-typescript-loader' },
      },
      // addition - add source-map support
      {
        enforce: 'pre',
        test: /src\/.*\.js$/,
        loader: 'source-map-loader',
      },
    ],
  },
  resolve: {
    // changed from extensions: [".js", ".jsx"]
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
};
