#!/bin/sh

# Ensure the volume has correct permissions
chown -R root:root /vault/data

# Start Vault normally (no su)
vault server -config=/vault/config/vault.hcl
