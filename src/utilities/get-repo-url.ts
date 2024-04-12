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

// returns the server name for (protocol-less) container urls
// url/image, url/image:tag, url/image@digest (including sha256: prefix)
export function getContainersURL({
  name,
  tag,
  digest,
}: {
  name: string;
  tag?: string;
  digest?: string;
}) {
  const host = window.location.host;

  return `${host}/${name}${tag ? `:${tag}` : ''}${
    digest && !tag ? `@${digest}` : ''
  }`;
}

// returns controller UI URL for the EE add form, prefilling a chosen image from hub
export function controllerURL({
  image,
  tag,
  digest,
}: {
  image: string;
  tag?: string;
  digest?: string;
}) {
  if (!digest && !tag) {
    tag = 'latest';
  }

  const imageUrl = encodeURIComponent(
    getContainersURL({
      name: image,
      tag,
      digest,
    }),
  );

  // TODO update to 2.5 link
  return `${window.location.origin}/#/execution_environments/add?image=${imageUrl}`;
}
