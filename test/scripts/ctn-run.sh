#!/bin/bash

SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

HUB_UI_LOCATION=${HUB_UI_LOCATION:-"${SCRIPTDIR}/../../"}

docker run \
	-v ${HUB_UI_LOCATION}test/cypress/screenshots:/e2e/cypress/screenshots \
	-v ${HUB_UI_LOCATION}test/cypress/videos:/e2e/cypress/videos \
	--net="host" \
	-e CYPRESS_HOST \
	-e CYPRESS_BASE_URL \
	-e CYPRESS_PASSWORD \
	-e CYPRESS_USERNAME \
	-e CYPRESS_PREFIX \
	-e CONSOLE_LOG_TO_TERMINAL \
	-e HUB_ADMIN_GROUP \
	-e HUB_REQUIRE_CERTIFY \
	-e HUB_UPLOAD_TO_INBOUND \
	hubuitest
