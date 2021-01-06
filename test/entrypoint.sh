#!/bin/bash

echo "HOST =" $CYPRESS_HOST
echo "USERNAME =" $CYPRESS_USERNAME
echo "PASSWORD =" $CYPRESS_PASSWORD

if [[ -z "$CYPRESS_BASE_URL" ]]; then
    export CYPRESS_BASE_URL="http://$CYPRESS_HOST/"
fi

npx cypress run
