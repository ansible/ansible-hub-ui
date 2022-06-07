#!/bin/bash

# --------------------------------------------
# Export vars for helper scripts to use
# --------------------------------------------
# name of app-sre "application" folder this component lives in; needs to match for quay
export COMPONENT="automation-hub"
export WORKSPACE=${WORKSPACE:-$APP_ROOT} # if running in jenkins, use the build's workspace
export APP_ROOT=$(pwd)
COMMON_BUILDER=https://raw.githubusercontent.com/RedHatInsights/insights-frontend-builder-common/master
export NODE_BUILD_VERSION=14

export APP_NAME="automation-hub"  # name of app-sre "application" folder this component lives in
export COMPONENT_NAME="automation-hub"  # name of app-sre "resourceTemplate" in deploy.yaml for this component
export COMPONENTS_W_RESOURCES="all"  # components which should preserve resource settings (optional, default: none)

export IMAGE_FRONTEND="quay.io/cloudservices/ansible-hub-ui"
export IMAGE_FRONTEND_TAG=$(git rev-parse --short=7 HEAD)
export IMAGE_FRONTEND_SHA1=$(git rev-parse HEAD)
export IMAGE=${IMAGE_FRONTEND}

export IMAGE_BACKEND="quay.io/cloudservices/automation-hub-galaxy-ng"
export IMAGE_BACKEND_TAG=$(curl -s https://api.github.com/repos/ansible/galaxy_ng/commits/master | jq -r '.sha' | head -c7)
export BACKUP_APP_ROOT=$APP_ROOT

set -exv
# source is preferred to | bash -s in this case to avoid a subshell
source <(curl -sSL $COMMON_BUILDER/src/frontend-build.sh)
BUILD_RESULTS=$?

# install bonfire repo/initialize
CICD_URL=https://raw.githubusercontent.com/RedHatInsights/bonfire/master/cicd
curl -s "$CICD_URL/bootstrap.sh" > .cicd_bootstrap.sh
source .cicd_bootstrap.sh
source ${CICD_ROOT}/_common_deploy_logic.sh

# deploy to ephemeral
export NAMESPACE=$(bonfire namespace reserve)
bonfire deploy \
    ${APP_NAME} \
    --source=appsre \
    --ref-env insights-stage \
    --set-template-ref ${COMPONENT_NAME}=master \
    --set-image-tag ${IMAGE_BACKEND}=${IMAGE_BACKEND_TAG} \
    --set-template-ref automation-hub-frontend=${IMAGE_FRONTEND_SHA1} \
    --frontends=true \
    --namespace ${NAMESPACE} \
    --timeout ${DEPLOY_TIMEOUT} \
    ${COMPONENTS_ARG} \
    ${COMPONENTS_RESOURCES_ARG} \
    --set-parameter ${COMPONENT_NAME}/IMPORTER_JOB_NAMESPACE=${NAMESPACE}

# configure ephemeral environment
git clone https://github.com/ansible/galaxy_ng.git
cd galaxy_ng
oc project ${NAMESPACE}

echo "patching CONTENT_ORIGIN"
CONTENT_ORIGIN=$(oc get route -l frontend=automation-hub -o jsonpath='https://{.items[0].spec.host}')
oc patch clowdapp automation-hub --type=json -p '[{"op": "replace", "path": "/spec/deployments/1/podSpec/env/1/value", "value": "'"${CONTENT_ORIGIN}"'"}]'
sleep 5
oc rollout status deploy/automation-hub-galaxy-api

echo "patching PULP_AWS_S3_ENDPOINT_URL"
oc create route edge minio --service=env-${NAMESPACE}-minio --insecure-policy=Redirect
MINIO_ROUTE=$(oc get route minio -o jsonpath='https://{.spec.host}{"\n"}')
oc patch clowdapp automation-hub --type=json -p '[{"op": "add", "path": "/spec/deployments/2/podSpec/env/-", "value": {"name": "PULP_AWS_S3_ENDPOINT_URL", "value": "'"${MINIO_ROUTE}"'"}}]'
sleep 5
oc rollout status deploy/automation-hub-pulp-content-app

echo "Get pod names"
AH_API_POD=$(oc get pod -l pod=automation-hub-galaxy-api -o jsonpath='{.items[0].metadata.name}')
DB_POD=$(oc get pod -l service=db -o jsonpath='{.items[0].metadata.name}')

echo "Creating test data"
oc exec $AH_API_POD -c automation-hub-galaxy-api -i -- /entrypoint.sh manage shell < dev/ephemeral/create_objects.py

echo "Fixing keycloak user permissions"
oc exec $AH_API_POD -c automation-hub-galaxy-api -i -- /entrypoint.sh manage shell < dev/ephemeral/fixuser.py

cd ..
# end configuring ephemeral

# smoke tests
#source dev/ephemeral/smoke_test.sh

# Stubbed out for now, will be added as tests are enabled
mkdir -p $WORKSPACE/artifacts
cat << EOF > $WORKSPACE/artifacts/junit-dummy.xml
<testsuite tests="1">
    <testcase classname="dummy" name="dummytest"/>
</testsuite>
EOF

# teardown_docker
exit $BUILD_RESULTS
