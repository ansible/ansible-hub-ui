import { type WriteOnlyFieldType } from 'src/api';

export function isWriteOnly(
  name: string,
  writeOnlyFields: WriteOnlyFieldType[],
) {
  const field = writeOnlyFields.find((el) => el.name === name);
  return !!field;
}

export function isFieldSet(
  name: string,
  writeOnlyFields: WriteOnlyFieldType[],
) {
  const field = writeOnlyFields.find((el) => el.name === name);
  if (field) {
    return field.is_set;
  } else {
    throw `Field ${name} is not in writeOnlyFields`;
  }
}
