#!/bin/sh
if [[ $DEPLOYMENT_MODE == 'insights' ]]
then
  npm run start
elif [[ $DEPLOYMENT_MODE == 'community' ]]
then
  npm run start-community
else
  npm run start-standalone
fi
