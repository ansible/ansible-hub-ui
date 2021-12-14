import ReducerRegistry from '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry';
import promise from 'redux-promise-middleware';

let registry;

export function init(...middleware) {
  if (!registry) {
    registry = new ReducerRegistry({}, [promise, ...middleware]);
  }

  return registry;
}

export function getStore() {
  return registry.getStore();
}

export function register(...args) {
  return registry.register(...args);
}
