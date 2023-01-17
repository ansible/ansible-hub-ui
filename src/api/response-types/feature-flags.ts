export class FeatureFlagsType {
  // execution environments menu section
  execution_environments: boolean;

  // keycloak login screen
  external_authentication: boolean;

  // community version
  legacy_roles: boolean;

  // collection signing
  can_create_signatures: boolean;
  can_upload_signatures: boolean;
  collection_auto_sign: boolean;
  collection_signing: boolean;
  display_signatures: boolean;
  require_upload_signatures: boolean;
  signatures_enabled: boolean;

  // container signing (EE)
  container_signing: boolean;

  // errors
  _messages: string[];
}
