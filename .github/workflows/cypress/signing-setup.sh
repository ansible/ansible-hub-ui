#!/usr/bin/env bash
set -e

# Signing keyring
export KEY_FINGERPRINT=$(gpg --show-keys --with-colons --with-fingerprint /tmp/ansible-sign.key | awk -F: '$1 == "fpr" {print $10;}' | head -n1)
export KEY_ID=${KEY_FINGERPRINT: -16}
gpg --batch --no-default-keyring --keyring /tmp/galaxy.kbx --import /tmp/ansible-sign.key
echo "${KEY_FINGERPRINT}:6:" | gpg --batch --no-default-keyring --keyring /tmp/galaxy.kbx --import-ownertrust

# Collection signing service
gpg --batch --import /tmp/ansible-sign.key
echo "${KEY_FINGERPRINT}:6:" | gpg --import-ownertrust

HAS_SIGNING=$(django-admin shell -c 'from pulpcore.app.models import SigningService;print(SigningService.objects.filter(name="ansible-default").count())' || true)
if [[ "$HAS_SIGNING" -eq "0" ]]; then
   django-admin add-signing-service ansible-default /var/lib/pulp/scripts/collection-sign.sh ${KEY_ID}
fi


# Container signing service
if ! skopeo --version > /dev/null; then
   echo 'WARNING: skopeo is not installed. Skipping container signing service setup.'
   exit 1
fi

echo "Setting up container signing service."
gpg --batch --import /tmp/ansible-sign.key &>/dev/null
echo "${KEY_FINGERPRINT}:6:" | gpg --import-ownertrust &>/dev/null

HAS_CONTAINER_SIGNING=$(django-admin shell -c 'from pulpcore.app.models import SigningService;print(SigningService.objects.filter(name="container-default").count())' 2>/dev/null || true)
if [[ "$HAS_CONTAINER_SIGNING" -eq "0" ]]; then
   echo "Creating container signing service. using key ${KEY_ID}"
   django-admin add-signing-service container-default /var/lib/pulp/scripts/container-sign.sh ${KEY_ID} --class container:ManifestSigningService
else
   echo "Container signing service already exists."
fi
