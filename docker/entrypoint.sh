#!/bin/sh
if [[ $DEPLOYMENT_MODE == 'insights' ]]
then
  echo 1>&2
  echo 'ANSIBLE_HUB_UI_PATH not supported in insights mode' 1>&2
  echo 1>&2
  echo 'please run' 1>&2
  echo '  npm run start' 1>&2
  echo 'in the UI dir manually' 1>&2
  echo 1>&2
else
  npm run start-standalone
fi
