// Checks that at least one filter is set
import { some } from 'lodash';
export function filterIsSet(params, filters) {
  return some(filters, filter => filter in params);
}
