#!/bin/sh
if [[ $DEPLOYMENT_MODE == 'insights' ]]
then
  npm run start
else
  npm run start-standalone
fi
