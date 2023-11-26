module.exports = {
  appname: 'automation-hub',
  appUrl:
    process.env.HUB_CLOUD_BETA === 'true'
      ? '/preview/ansible/automation-hub/'
      : '/ansible/automation-hub/',
  bundle: 'ansible',
  debug: true,
  hotReload: process.env.HOT === 'true',
  interceptChromeConfig: false,
  plugins: [],
  proxyVerbose: true,
  useProxy: true,
};
