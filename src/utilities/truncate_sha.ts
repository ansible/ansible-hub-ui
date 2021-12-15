export function truncateSha(sha) {
  const splitSha = sha.split(':');
  return splitSha[0] + ':' + splitSha[1].slice(0, 8);
}
