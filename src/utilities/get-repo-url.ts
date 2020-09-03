// Returns the API path for a specific repository
export function getRepoUrl(distributionPath: string) {
  // If the api is hosted on another URL, use API_HOST as the host part of the URL.
  // Otherwise use the host that the UI is served from
  const host = !!API_HOST ? API_HOST : window.location.origin;

  return `${host}${API_BASE_PATH}content/${distributionPath}/`;
}
