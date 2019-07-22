// Fool TypeScript into thinking that we actually have typings for these components.
// This will tell typescript that anything from this module is of type any.
// TODO: Add actual typings to the upstream project

declare module '@redhat-cloud-services/frontend-components';
declare module 'axios-mock-adapter';
declare module 'react-markdown';
