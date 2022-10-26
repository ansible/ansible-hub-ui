#!/bin/bash
set -e
set -x

push () {
    echo "PUSHING $1"
    rm -rf dist/.git build/.git
    .travis/release.sh "$1"
}

if [ "${TRAVIS_BRANCH}" = "master" ]; then
    # always push to stage-beta
    HUB_CLOUD_BETA="true" npm run deploy
    push "qa-beta"

    # only push to stage-stable when enabled
    if [ -f .cloud-stage-cron.enabled ]; then
        HUB_CLOUD_BETA="false" npm run deploy
        push "qa-stable"
    fi
fi

if [ "${TRAVIS_BRANCH}" = "prod-beta" ]; then
    HUB_CLOUD_BETA="true" npm run deploy
    push "prod-beta"
fi

if [ "${TRAVIS_BRANCH}" = "prod-stable" ]; then
    HUB_CLOUD_BETA="false" npm run deploy
    push "prod-stable"
fi
