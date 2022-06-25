#!/usr/bin/env bash
set -e

FILE_PATH="$1"
SIGNATURE_PATH="$1.asc"

ADMIN_ID="galaxy3@ansible.com"
PASSWORD="Galaxy2022"

# Create a detached signature
gpg --quiet --batch --pinentry-mode loopback --yes --passphrase "$PASSWORD" \
    --homedir "~/.gnupg/" --detach-sign --default-key "$ADMIN_ID" \
    --no-default-keyring --keyring "${KEYRING:-/etc/pulp/certs/galaxy.kbx}" \
    --armor --output "$SIGNATURE_PATH" "$FILE_PATH"

echo {\"file\": \"$FILE_PATH\", \"signature\": \"$SIGNATURE_PATH\"}
