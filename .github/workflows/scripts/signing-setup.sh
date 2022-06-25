#!/usr/bin/env bash
set -e

# Signing keyring
export KEY_FINGERPRINT=$(gpg --show-keys --with-colons --with-fingerprint /tmp/ansible-sign.key | awk -F: '$1 == "fpr" {print $10;}' | head -n1)
export KEY_ID=${KEY_FINGERPRINT: -16}
gpg --batch --no-default-keyring --keyring /etc/pulp/certs/galaxy.kbx --import /tmp/ansible-sign.key
echo "${KEY_FINGERPRINT}:6:" | gpg --batch --no-default-keyring --keyring /etc/pulp/certs/galaxy.kbx --import-ownertrust

# Signing service
export KEY_FINGERPRINT=$(gpg --show-keys --with-colons --with-fingerprint /tmp/ansible-sign.key | awk -F: '$1 == "fpr" {print $10;}' | head -n1)
export KEY_ID=${KEY_FINGERPRINT: -16}
gpg --batch --import /tmp/ansible-sign.key
echo "${KEY_FINGERPRINT}:6:" | gpg --import-ownertrust

HAS_SIGNING=$(django-admin shell -c 'from pulpcore.app.models import SigningService;print(SigningService.objects.filter(name="ansible-default").count())' || true)
if [[ "$HAS_SIGNING" -eq "0" ]]; then
   django-admin add-signing-service ansible-default /var/lib/pulp/scripts/collection-sign.sh ${KEY_ID}
fi
