#!/bin/bash
set -e

npm ci

npm run gettext:extract
npm run gettext:compile

if [ "$IS_PR" = true ]; then
    npm run build-insights
else
    export HUB_CLOUD_BETA=false
    npm run build-insights
    mv ${DIST_FOLDER} stable

    export HUB_CLOUD_BETA=true
    npm run build-insights
    mv ${DIST_FOLDER} preview
    
    mkdir -p ${DIST_FOLDER}
    mv stable ${DIST_FOLDER}/stable
    mv preview ${DIST_FOLDER}/preview
fi

# do not use dev dockerfile
rm "$APP_ROOT"/Dockerfile "$APP_ROOT"/.dockerignore /workspace/source/source/.dockerignore || true
