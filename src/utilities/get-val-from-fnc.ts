import { isFunction } from 'lodash';

export const getValueFromFunction = (value) =>
  isFunction(value) ? value() : value;
