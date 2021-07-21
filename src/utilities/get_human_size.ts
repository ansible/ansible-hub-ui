const units = ['bytes', _`KB`, _`MB`, _`GB`, _`TB`, _`PB`, _`EB`, _`ZB`, _`YB`];

export function getHumanSize(x) {
  let l = 0,
    n = parseInt(x, 10) || 0;

  while (n >= 1024 && ++l) {
    n = n / 1024;
  }
  return n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l];
}
