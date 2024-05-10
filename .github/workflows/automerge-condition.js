// get these values from env instead of cli args due to RCE issues
const actor = process.env.GITHUB_ACTOR;
const branch = process.env.GITHUB_HEAD_REF;
const prTitle = process.env.PR_TITLE;

console.log({ actor, branch, prTitle });

if (actor != 'dependabot[bot]') {
  console.log('Actor incorrect (GITHUB_ACTOR)');
  process.exit(1);
}

if (!branch) {
  console.log('Branch name not set (GITHUB_HEAD_REF)');
  process.exit(1);
}

if (!prTitle) {
  console.log('PR title not set (PR_TITLE)');
  process.exit(1);
}

if (prTitle.includes('@types/node') && !prTitle.match(/from (\d+)\.\d+\.\d+ to \1\.\d+\.\d+/)) {
  console.log('Not automerging major @types/node version bump');
  process.exit(1);
}

process.exit(0);
