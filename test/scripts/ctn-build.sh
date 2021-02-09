#!/bin/bash

SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

HUB_ADMIN_USERNAME=${HUB_ADMIN_USERNAME:-"admin"}
HUB_ADMIN_PASSWORD=${HUB_ADMIN_PASSWORD:-"admin"}
HUB_SERVER=${HUB_SERVER:-"localhost:8002"}
HUB_UI_LOCATION=${HUB_UI_LOCATION:-"${SCRIPTDIR}/.."}
CYPRESS_PREFIX=${CYPRESS_PREFIX:-"/api/automation-hub/"}
CYPRESS_BASE_URL=${CYPRESS_BASE_URL:-"http://${HUB_SERVER}"}

docker build $SCRIPTDIR/../ -t hubuitest
