#!/bin/bash
set -e
set -x

if [ "${TRAVIS_BRANCH}" = "master" ]; then
    # always push to stage-beta
    HUB_CLOUD_BETA="true" npm run deploy
    echo "PUSHING qa-beta"
    rm -rf ./dist/.git
    .travis/release.sh "qa-beta"

    # only push to stage-stable when enabled
    if [ -f .cloud-stage-cron.enabled ]; then
        HUB_CLOUD_BETA="false" npm run deploy
        echo "PUSHING qa-stable"
        rm -rf ./dist/.git
        .travis/release.sh "qa-stable"
    fi
fi

if [[ "${TRAVIS_BRANCH}" = "prod-beta" || "${TRAVIS_BRANCH}" = "prod-stable" ]]; then
    npm run deploy
    echo "PUSHING ${TRAVIS_BRANCH}"
    rm -rf ./build/.git
    .travis/release.sh "${TRAVIS_BRANCH}"
fi
