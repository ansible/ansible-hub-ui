const { exec } = require('node:child_process');
const [ _node, _automerge, branch, prTitle, actor ] = process.argv;

console.log({ branch, prTitle, actor });

if (!branch) {
  console.log('Branch name argument (first) was not specified');
  process.exit(1);
}

if (!prTitle) {
  console.log('PR title argument (second) was not specified');
  process.exit(1);
}

if (!actor) {
  console.log('Actor argument (third) was not specified');
  process.exit(1);
}

if (actor != 'dependabot[bot]') {
  console.log('Automerge works only for PRs created by dependabot.');
  process.exit(1);
}

if (prTitle.includes('patternfly')) {
  console.log('Automerge can\'t merge patternfly PRs.');
  process.exit(1);
}

if (prTitle.includes('@types/node')) {
  console.log('Checking for @types/node version.');
  const pattern = /from 16[.]\d+[.]\d+ to 16[.]\d+[.]\d+/;
  if (pattern.test(prTitle)) {
    console.log('Version does match the pattern ' + pattern);
  } else {
    console.log('Version does not match the pattern ' + pattern);
    process.exit(1);
  }
}

console.log('Waiting for checks');

let waitCount = 0;

function waitForAll() {
  waitCount++;
  // dont cycle more that 50x (that is 50 minutes)
  if (waitCount > 50) {
    console.log('Waiting limit reached. Exiting.');
    process.exit(1);
  }

  // name,status,conclusion,event,displayTitle,workflowName,createdAt,startedAt,updatedAt,headSha,databaseId,workflowDatabaseId
  console.log('run exec');
  exec(
    `gh run list -b "${branch}" --limit 99999 --json name,status,conclusion,event,displayTitle,workflowName,createdAt,startedAt,updatedAt,headSha,databaseId,workflowDatabaseId`,
    (error, stdout, stderr) => {
      console.log('inside exec');

      if (error) {
        console.log(`error: ${error.message}`);
        process.exit(1);
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        process.exit(1);
      }

      console.log('parse data');

      data = JSON.parse(stdout);

      let allSuccess = true;
      let allCompleted = true;

      console.log('Items found: ' + data.length);

      // select unique names
      let workflows = data
        .filter(
          (a) =>
            a.workflowName != 'Automerge' &&
            a.workflowName != 'Add labels to pull request',
        )
        .map((a) => a.workflowName);
      workflows = [...new Set(workflows)];
      console.log('distinct workflows');
      console.log(workflows);
      console.log('end of distinct workflows');

      console.log('latest items:');

      let latest = [];
      workflows.forEach((workflow) => {
        let items = data
          .filter((a) => a.workflowName == workflow)
          .sort((a, b) => a.startedAt > b.startedAt);
        latest.push(items[0]);
        console.log(items[0]);
      });

      latest.forEach((item) => {
        if (item.conclusion != 'success') {
          allSuccess = false;
        }
        if (item.status != 'completed') {
          allCompleted = false;
        }
        console.log(
          item.name + ' is ' + item.status + ' with result ' + item.conclusion,
        );
      });

      console.log('All completed: ' + allCompleted);
      console.log('All success: ' + allSuccess);

      if (allCompleted && allSuccess) {
        console.log('All checks has completed succesfuly,.');
        process.exit(0);
      }

      if (allCompleted && !allSuccess) {
        console.log(
          'Not all checks has completed succesfuly, automerge failed.',
        );
        process.exit(1);
      }

      setTimeout(waitForAll, 60000);
    },
  );
}

waitForAll();
