#!/bin/bash

echo "HOST =" $CYPRESS_HOST
echo "USERNAME =" $CYPRESS_USERNAME
echo "PASSWORD =" $CYPRESS_PASSWORD
echo "BASE_URL =" $CYPRESS_BASE_URL

if [[ -z "$CYPRESS_BASE_URL" ]]; then
    export CYPRESS_BASE_URL="http://$CYPRESS_HOST/"
fi

if [ ! -f cypress.env.json ]; then
    cat << EOF > cypress.env.json
    {
        "host": "$CYPRESS_HOST",
        "baseUrl":"$CYPRESS_BASE_URL",
        "prefix": "$CYPRESS_PREFIX",
        "username": "$CYPRESS_USERNAME",
        "password": "$CYPRESS_PASSWORD"
    }
EOF
fi
npx cypress run --browser chrome
