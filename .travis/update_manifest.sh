#!/bin/bash

set -o nounset
set -o errexit


readonly TRAVIS_PULL_REQUEST="${TRAVIS_PULL_REQUEST:-}"
readonly TRAVIS_BRANCH="${TRAVIS_BRANCH:-}"

readonly MANIFESTS_GIT_USER="${MANIFESTS_GIT_USER:-}"
readonly MANIFESTS_GIT_EMAIL="${MANIFESTS_GIT_EMAIL:-}"
readonly MANIFESTS_GIT_URL="git@github.com:RedHatInsights/manifests.git"

readonly GENERATE_MANIFEST=".travis/generate_manifest.js"
readonly MANIFESTS_DIR='/tmp/manifests'
readonly MANIFEST_FILE="${MANIFESTS_DIR}/automation-hub/automation-hub-ui.txt"


log_message() {
    echo "$BASH_SOURCE:" "$@" >&2
}


if [[ "$TRAVIS_PULL_REQUEST" != 'false' ]]; then
    log_message 'Ignoring manifest update for pull request.'
    exit 0
fi


if [[ "${TRAVIS_BRANCH}" == 'master' ]]; then
    manifests_branch='master'
elif [[ "${TRAVIS_BRANCH}" == 'stable-prod' ]]; then
    manifests_branch='stable' # FIXME: no such branch
else
    log_message "Ignoring manifest update for branch '${TRAVIS_BRANCH}'."
    exit 0
fi


# decrypt deploy key and use
gpg --quiet --batch --yes --decrypt --passphrase="$MANIFEST_PASSPHRASE" --output .travis/deploy_manifest .travis/deploy_manifest.gpg

chmod 600 .travis/deploy_manifest
eval `ssh-agent -s`
ssh-add .travis/deploy_manifest


git clone --depth=10 --branch="${manifests_branch}" \
    "${MANIFESTS_GIT_URL}" "${MANIFESTS_DIR}" &>/dev/null

mkdir -p "$(dirname "${MANIFEST_FILE}")"
"${GENERATE_MANIFEST}" "${MANIFEST_FILE}"

cd "${MANIFESTS_DIR}"
git config user.name "${MANIFESTS_GIT_USER}"
git config user.email "${MANIFESTS_GIT_EMAIL}"

git add "${MANIFEST_FILE}"

if ! git diff-index --quiet HEAD; then
    git commit --message "Update manifest for Automation Hub UI"
    if ! git push origin "${manifests_branch}" &>/dev/null; then
        log_message "Error: git push to branch '${manifests_branch}' failed."
        exit 1
    fi
else
    log_message "Nothing to commit."
fi
