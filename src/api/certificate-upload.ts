import { PulpAPI } from './pulp';

interface UploadProps {
  file: {
    name: string;
    type: 'text/plain';
  };
  // Takes pulp_href for repository
  repository: string;
  // Takes pulp_href for collection
  signed_collection: string;
}

class API extends PulpAPI {
  apiPath = 'content/ansible/collection_signatures/';

  upload(data: UploadProps) {
    return this.http.post(this.apiPath, data);
  }
}

export const CertificateUploadAPI = new API();
