import { PulpAPI } from "./pulp";
import { RoleType } from "./response-types/role";


export class API extends PulpAPI {
    apiPath = 'v3/roles/'

    constructor() {
        super();
    }

    list(params?, role?: string) {
        const path = this.apiPath + role + '/';
        return super.list(params, path).then((response) => ({
          ...response,
          data: {
            ...response.data,
            // remove module_utils, doc_fragments from each item
            // data: response.data.data.map(filterListItem),
          },
        }));
      }


}

export const RoleAPI = API