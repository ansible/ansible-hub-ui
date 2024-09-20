export class FeatureFlagsType {
  // execution environments
  container_signing: boolean;
  execution_environments: boolean;

  // gateway / keycloak
  dab_resource_registry: boolean;
  external_authentication: boolean;

  // community mode
  display_repositories: boolean;
  legacy_roles: boolean;

  // collection signing
  can_create_signatures: boolean;
  can_upload_signatures: boolean;
  collection_auto_sign: boolean;
  collection_signing: boolean;
  display_signatures: boolean;
  require_upload_signatures: boolean;
  signatures_enabled: boolean;

  // errors
  _messages: string[];
}
