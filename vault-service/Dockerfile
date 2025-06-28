FROM hashicorp/vault:1.15

# Create config directory
RUN mkdir -p /vault/config

# Copy Vault config
COPY vault.hcl /vault/config/vault.hcl

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8200

ENTRYPOINT ["/entrypoint.sh"]
