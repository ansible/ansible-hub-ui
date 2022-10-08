import { HiddenFieldType } from 'src/api';

export function isHidden(name: string, hiddenFields: HiddenFieldType[]) {
  const field = hiddenFields.find((el) => el.name === name);
  return !!field;
}

export function isFieldSet(name: string, hiddenFields: HiddenFieldType[]) {
  const field = hiddenFields.find((el) => el.name === name);
  if (field) {
    return field.is_set;
  } else {
    throw 'Field ${name} is not in hiddenFields (write_only_fields)';
  }
}

// Deletes any hidden (write only) fields from the object so that they don't
// get sent to the API
export function clearSetFieldsFromRequest(
  data,
  hiddenFields: HiddenFieldType[],
): object {
  const newObj = { ...data };

  for (const field of hiddenFields) {
    if (field.is_set) {
      delete newObj[field.name];
    }
  }

  return newObj;
}
