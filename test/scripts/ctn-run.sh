#!/bin/bash

SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

HUB_ADMIN_USERNAME=${HUB_ADMIN_USERNAME:-"admin"}
HUB_ADMIN_PASSWORD=${HUB_ADMIN_PASSWORD:-"admin"}
HUB_SERVER=${HUB_SERVER:-"localhost:8002"}
HUB_UI_LOCATION=${HUB_UI_LOCATION:-"${SCRIPTDIR}/.."}
CYPRESS_PREFIX=${CYPRESS_PREFIX:-"/api/automation-hub/"}
CYPRESS_BASE_URL=${CYPRESS_BASE_URL:-"http://${HUB_SERVER}"}

docker run \
	-v ${HUB_UI_LOCATION}test/cypress/screenshots:/e2e/cypress/screenshots \
	-v ${HUB_UI_LOCATION}test/cypress/videos:/e2e/cypress/videos \
	--net="host" \
	-e CYPRESS_PASSWORD=${HUB_ADMIN_PASSWORD} \
	-e CYPRESS_USERNAME=${HUB_ADMIN_USERNAME} \
	-e CYPRESS_HOST=${HUB_SERVER} \
	-e CYPRESS_PREFIX=${CYPRESS_PREFIX} \
	-e CYPRESS_BASE_URL=${CYPRESS_BASE_URL} \
	-e CONSOLE_LOG_TO_TERMINAL \
	-e HUB_ADMIN_GROUP \
	-e HUB_REQUIRE_CERTIFY \
	-e HUB_UPLOAD_TO_INBOUND \
	hubuitest
