#!/bin/bash

# setNpmOrYarn
USES_NPM=true

# install dependencies
npm ci
npm i -g npm-run-all

# build
if [ $IS_PR = true ]; then
  npm-run-all build-insights 'lint:!(po|yaml)'
else
  npm run deploy
fi

# do not use dev dockerfile
rm $APP_ROOT/Dockerfile
rm $APP_ROOT/.dockerignore
