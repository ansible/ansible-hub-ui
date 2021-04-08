export function truncateSha(sha) {
  let splitSha = sha.split(':');
  return splitSha[0] + ':' + splitSha[1].slice(0, 8);
}
