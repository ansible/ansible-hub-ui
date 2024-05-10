const { exec } = require('node:child_process');

// get these values from env instead of cli args due to RCE issues
const branch = process.env.GITHUB_HEAD_REF;

if (!branch) {
  console.log('Branch name not set (GITHUB_HEAD_REF)');
  process.exit(1);
}

let waitCount = 0;

function waitForAll() {
  waitCount++;

  // fail after 30 minutes
  if (waitCount > 30) {
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

      // retry after a minute
      setTimeout(waitForAll, 60000);
    },
  );
}

waitForAll();
