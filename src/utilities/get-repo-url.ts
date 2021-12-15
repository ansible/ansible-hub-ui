// Returns the API path for a specific repository
export function getRepoUrl(distributionPath: string) {
  // If the api is hosted on another URL, use API_HOST as the host part of the URL.
  // Otherwise use the host that the UI is served from
  const host = API_HOST ? API_HOST : window.location.origin;

  return distributionPath
    ? `${host}${API_BASE_PATH}content/${distributionPath}/`
    : `${host}${API_BASE_PATH}`;
}

// returns the server name for (protocol-less) container urls
export function getContainersURL() {
  return window.location.href.split('://')[1].split('/ui')[0];
}
