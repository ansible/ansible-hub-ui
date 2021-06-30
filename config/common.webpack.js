/* global require, module, __dirname, process */

const path = require('path');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const gitRevisionPlugin = new GitRevisionPlugin({
  branch: true,
});
const entry =
  process.env.NODE_ENV === 'production'
    ? path.resolve(__dirname, '../src/entry.js')
    : path.resolve(__dirname, '../src/entry-dev.js');

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
console.log('PROCESS.ENV:');
console.log(process.env.NODE_ENV);
console.log(process.env.BUILD_BETA);
console.log(process.env.BRANCH);
console.log(gitRevisionPlugin.branch());
console.log(publicPath);

module.exports = {
  paths: {
    entry,
    public: path.resolve(__dirname, '../dist'),
    publicPath,
  },
  deploymentEnv,
  release,
};
