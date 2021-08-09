import { WriteOnlyFieldType } from 'src/api';

export function isFieldSet(
  name: string,
  writeOnlyFields: WriteOnlyFieldType[],
) {
  const field = writeOnlyFields.find((el) => el.name === name);
  if (field) {
    console.log(field);
    return field.is_set;
  } else {
    throw `Field ${name} is not in writeOnlyFields`;
  }
}

// Deletes any write only fields from the object so that they don't
// get sent to the API
export function clearSetFieldsFromRequest(
  data: any,
  writeOnlyFields: WriteOnlyFieldType[],
): object {
  const newObj = { ...data };

  for (const field of writeOnlyFields) {
    if (field.is_set) {
      delete newObj[field.name];
    }
  }

  return newObj;
}
