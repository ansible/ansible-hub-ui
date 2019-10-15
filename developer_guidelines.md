# Developer Guidelines

These are the rules we try to follow to make sure this project is as consistent as possible

## Imports

### Ordering

Imports should be ordered as follows:

1. Any imports from 'react'
2. Stylesheets
3. Any imports from 3rd party libraries such as patternfly, lodash, etc.
4. Local imports

### Importing and exporting local components

All components in local directories should be exported and imported via the index.ts file
at the directory's root.

Correct way to import:

```
import { CollectionList, PartnerHeader } from '../../components';
```

Incorrect way to import:

```
import { CollectionList } from '../../components/collection-list/collection-list'
import { PartnerHeader } from '../../components/headers/partner-header'
```

Not only is this a lot cleaner to read and update, but it also makes it easier to reorganize
code without breaking imports.

## Page Query Params

The state of a page should largely be dictated by the query parameter for that page when possible.
This means that a page's components such as pagination, tabs, filter's etc. should derive their
values from the page's query parameters as well as update the query params when they change.

This is done by storing a `params` object in the component state. This object contains
keywords for each parameter in they query. Params with single values are stored as a single
value and params with multiple values are stored as an array. As an example

`?key1=hi&key1=bye&key2=world` is represented as

```
this.state.params = {
    key1: ['hi', 'bye'],
    key2: 'world'
}
```

Updating the params keyword should be done with the `ParamHelper` object found in
`src/utilities/param-helper`. This object contains a set of pure functions that can
be used to update `params` as well as mixins that can be used to update the pages's
query params when the state changes.

An example of how this works is the `Sort` component (`src/components/patternfly-wrappers/sort.tsx`).
This component loads the field being sorted and direction to sort by from `params['sort']`.
When the component is changed it calls the `updateParams` callback which updates the component's
`params` object, the page's query params and optionally calls the API with the new params to
update the data being displayed.

Generally speaking a page's query parameters should match the API's query parameters when
possible.

Following these rules will ensure that specific page's state can be bookmarked, shared,
and retained after they are reloaded.

## URLs

**NEVER** hardcode URLs to any paths within automation hub. This makes it very difficult
to update the app's routing later on.

Instead use the `Paths` enum to get URLs for static routes and `formatPath` to get
dynamic routes. Both of these are found in `src/paths.tsx`

Example:

```
// Static route
<Redirect to={Paths.search}/>

// Dynamic route
<Redirect to={formatPath(Paths.editNamespace, {namespace: NSname});}/>
```
