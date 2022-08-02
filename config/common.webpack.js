/* global require, module, __dirname, process */

const path = require('path');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const gitRevisionPlugin = new GitRevisionPlugin({
  branch: true,
});

const gitBranch = process.env.BRANCH || gitRevisionPlugin.branch();
const betaBranch =
  gitBranch === 'master' ||
  gitBranch === 'qa-beta' ||
  gitBranch === 'prod-beta';

let deploymentEnv = 'apps';
let release = '';

if (
  (process.env.NODE_ENV === 'production' && betaBranch) ||
  process.env.BUILD_BETA === 'true'
) {
  deploymentEnv = 'beta/apps';
  release = 'beta';
}

const publicPath = `/${deploymentEnv}/ansible/`;

module.exports = {
  paths: {
    public: path.resolve(__dirname, '../dist'),
    publicPath,
  },
  deploymentEnv,
  release,
};
