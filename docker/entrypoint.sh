#!/bin/sh
[ "$DEPLOYMENT_MODE" = 'insights' ] && exit 1

npm run start-standalone
