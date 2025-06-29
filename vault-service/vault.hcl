seal "awskms" {
  region     = "eu-north-1"
  kms_key_id = "341a6c8e-15e2-44b3-9f65-5cfb188d8a50"
  access_key = "{{env \"AWS_ACCESS_KEY_ID\"}}"
  secret_key = "{{env \"AWS_SECRET_ACCESS_KEY\"}}"
}

listener "tcp" {
  address = "0.0.0.0:8200"
  tls_disable = 1
}

storage "file" {
  path = "/vault/data"
}

ui = true
disable_mlock = true