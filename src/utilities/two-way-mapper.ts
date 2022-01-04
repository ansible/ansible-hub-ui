// returns value/key based on given value/key and a mapper
export function twoWayMapper(value: string, mapper: object) {
  if (Object.values(mapper).includes(value)) {
    return Object.keys(mapper).find((key) => mapper[key] === value);
  }
  if (Object.keys(mapper).includes(value)) {
    return mapper[value];
  }
  return undefined;
}
