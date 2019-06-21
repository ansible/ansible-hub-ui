/* global require, module, __dirname */
const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// const config = require('./ts.webpack.config');
const { config: webpackConfig, plugins } = config({
    rootFolder: resolve(__dirname, '../'),
    debug: true,
    https: true,
});

// Override sections of the webpack config to work with TypeScript
const newWebpackConfig = {
    ...webpackConfig,
    module: {
        rules: [
            {
                test: /src\/.*\.js$/,
                exclude: /(node_modules|bower_components)/i,
                use: [
                    { loader: 'source-map-loader' },
                    { loader: 'babel-loader' },
                    // eslint really hates some of the things prettier does,
                    // so we're disabling it here
                    // TODO: Figure out how to disable the rules that prettier
                    // breaks
                    // { loader: 'eslint-loader' },
                ],
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

module.exports = {
    ...newWebpackConfig,
    plugins,
};
