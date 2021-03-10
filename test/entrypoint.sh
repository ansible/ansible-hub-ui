#!/bin/bash

if [[ ! -z "$CYPRESS_USERNAME" ]]; then
    echo "CYPRESS_USERNAME = '$CYPRESS_USERNAME'"
else
    unset CYPRESS_USERNAME
fi

if [[ ! -z "$CYPRESS_PASSWORD" ]]; then
    echo "CYPRESS_PASSWORD = '$CYPRESS_PASSWORD'"
else
    unset CYPRESS_PASSWORD
fi

if [[ ! -z "$CYPRESS_BASE_URL" ]]; then
    echo "CYPRESS_BASE_URL = '$CYPRESS_BASE_URL'"
else
    unset CYPRESS_BASE_URL
fi

npx cypress run --browser chrome
