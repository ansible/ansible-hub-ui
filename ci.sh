#!/bin/bash
set -e

npm ci

npm run gettext:extract
npm run gettext:compile
npm run build-insights

# do not use dev dockerfile
rm "$APP_ROOT"/Dockerfile "$APP_ROOT"/.dockerignore || true
