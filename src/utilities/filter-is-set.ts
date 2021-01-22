// Checks that at least one filter is set
export function filterIsSet(params, filters) {
  let filterSet = false;

  filters.forEach(filter => {
    if (filter in params) {
      filterSet = true;
    }
  });

  return filterSet;
}
