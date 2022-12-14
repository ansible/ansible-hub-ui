// returns value/key based on given value/key and a mapper
export function twoWayMapper(mapper: object, value: string) {
  let name = undefined;
  if (Object.keys(mapper).includes(value)) {
    return mapper[value]?.name || value;
  } else {
    const permArray = Object.entries(mapper);
    permArray.map((p) => {
      if (value === p[1]['name']) {
        name = p[0];
      }
    });
    return name;
  }
}
