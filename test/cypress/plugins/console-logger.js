const CDP = require('chrome-remote-interface');

function logConsole({ args }) {
  console.log(...args.map((arg) => arg.value || arg.preview || arg));
}

function isChrome(browser) {
  return ['chrome', 'chromium'].includes(browser.family);
}

function ensureRdpPort(args) {
  const existing = args.find((arg) =>
    arg.startsWith('--remote-debugging-port'),
  );
  if (existing) {
    return Number(existing.split('=')[1]);
  }

  const port = 40000 + Math.round(Math.random() * 25000);
  args.push(`--remote-debugging-port=${port}`);
  return port;
}

function browserLaunchHandler(browser = {}, launchOptions) {
  if (!isChrome(browser)) {
    return console.log('unsupported browser', browser);
  }

  const args = launchOptions.args || launchOptions;
  const rdp = ensureRdpPort(args);

  const tryConnect = () => {
    new CDP({
      port: rdp,
    })
      .then((cdp) => {
        console.log('Connected to Chrome Debugging Protocol');

        /** captures logs from console.X calls */
        cdp.Runtime.enable();
        cdp.Runtime.consoleAPICalled(logConsole);

        cdp.on('disconnect', () => {
          console.log('Chrome Debugging Protocol disconnected');
        });
      })
      .catch(() => {
        setTimeout(tryConnect, 100);
      });
  };

  tryConnect();
  return launchOptions;
}

module.exports = {
  install: (on) => on('before:browser:launch', browserLaunchHandler),
};
