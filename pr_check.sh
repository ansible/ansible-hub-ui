#!/bin/bash

# --------------------------------------------
# Export vars for helper scripts to use
# --------------------------------------------
# name of app-sre "application" folder this component lives in; needs to match for quay
export COMPONENT="automation-hub"
export WORKSPACE=${WORKSPACE:-$APP_ROOT} # if running in jenkins, use the build's workspace
export APP_ROOT=$(pwd)
COMMON_BUILDER=https://raw.githubusercontent.com/RedHatInsights/insights-frontend-builder-common/master
export NODE_BUILD_VERSION=20

export APP_NAME="automation-hub"  # name of app-sre "application" folder this component lives in
export COMPONENT_NAME="automation-hub"  # name of app-sre "resourceTemplate" in deploy.yaml for this component
export COMPONENTS_W_RESOURCES="automation-hub"  # components which should preserve resource settings (optional, default: none)

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

export IMAGE_FRONTEND_TAG=${IMAGE_TAG}

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
    --set-image-tag ${IMAGE_FRONTEND}=${IMAGE_FRONTEND_TAG} \
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

dev/ephemeral/patch_ephemeral.sh
dev/ephemeral/create_keycloak_users.sh

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
