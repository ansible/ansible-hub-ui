// Returns the API path for a specific repository
export function getRepoURL(distribution_base_path, view_published = false) {
  // If the api is hosted on another URL, use API_HOST as the host part of the URL.
  // Otherwise use the host that the UI is served from
  const host = API_HOST ? API_HOST : window.location.origin;

  // repo/distro "published" is special; not related to repo pipeline type
  if (distribution_base_path === 'published' && view_published === false) {
    return `${host}${API_BASE_PATH}`;
  }

  return `${host}${API_BASE_PATH}content/${distribution_base_path}/`;
}
