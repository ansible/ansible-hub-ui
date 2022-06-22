export class FeatureFlagsType {
  execution_environments: boolean;
  external_authentication: boolean;

  // signing
  can_create_signatures: boolean;
  can_upload_signatures: boolean;
  collection_auto_sign: boolean;
  collection_signing: boolean;
  display_signatures: boolean;
  require_upload_signatures: boolean;
  signatures_enabled: boolean;
}
