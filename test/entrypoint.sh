#!/bin/bash

echo "HOST" $CYPRESS_HOST
echo "USER" $CYPRESS_USERNAME
echo "PASS" $CYPRESS_PASSWORD

if [[ -z "$CYPRESS_BASE_URL" ]]; then
    export CYPRESS_BASE_URL="http://$CYPRESS_HOST"
fi

npx cypress run
