#!/bin/bash

echo "CYPRESS_HOST = '$CYPRESS_HOST'"
echo "CYPRESS_USERNAME = '$CYPRESS_USERNAME'"
echo "CYPRESS_PASSWORD = '$CYPRESS_PASSWORD'"
echo "CYPRESS_BASE_URL = '$CYPRESS_BASE_URL'"

if [[ "$CYPRESS_HOST" = "" ]]; then
    unset CYPRESS_HOST
fi

if [[ "$CYPRESS_BASE_URL" = "" ]]; then
    unset CYPRESS_BASE_URL
fi

if [[ "$CYPRESS_USERNAME" = "" ]]; then
    unset CYPRESS_USERNAME
fi

if [[ "$CYPRESS_PASSWORD" = "" ]]; then
    unset CYPRESS_PASSWORD
fi

if [[ -z "$CYPRESS_BASE_URL" ]]; then
    if [[ -e "$CYPRESS_HOST" ]]; then
        export CYPRESS_BASE_URL="http://$CYPRESS_HOST/"
    fi
fi

npx cypress run --browser chrome
