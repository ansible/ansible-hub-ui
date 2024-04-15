# Developer Guidelines

These are the rules we try to follow to make sure this project is as consistent as possible


## Imports

Imports get automatically sorted by prettier. For local imports, make sure to import from `src/SUBDIR` without the full path, or `./FILE`.
Only use the extension for scss & images.

All components in local directories should be exported and imported via the `index.ts` file at the directory's root.

Correct way to import:

```
import { CollectionList, PartnerHeader } from 'src/components';
```

Incorrect way to import:

```
import { CollectionList } from '../collection-list/collection-list'
import { PartnerHeader } from 'src/components/headers/partner-header'
```

This is configured in `.prettierrc.yaml` using the `@trivago/prettier-plugin-sort-imports`
prettier plugin and the `importOrder*` configs.


## Page Query Params

The state of a page should largely be dictated by the query parameter for that page when possible. This means that components such as pagination, tabs, filters etc. should derive their values from the page's query parameters as well as update the query params when they change.

This is done by storing a `params` object in the component state. This object contains keywords for each parameter in they query. Params with single values are stored as a single value and params with multiple values are stored as an array.

As an example `?key1=hi&key1=bye&key2=world` is represented as

```
this.state.params = {
    key1: ['hi', 'bye'],
    key2: 'world'
}
```

Updating the params keyword should be done with `ParamHelper` from `src/utilities`.
This object contains a set of pure functions that can be used to update `params` as well as mixins that can be used to update query params when the state changes.

An example of how this works is the `Sort` component (`src/components/sort.tsx`).
This component loads the field being sorted and direction to sort by from `params.sort`.
When the component is changed, it calls the `updateParams` callback which updates the component's `params` object, the page's query params and optionally calls the API with the new params to update the data being displayed.

Generally speaking a page's query parameters should match the API's query parameters when possible.

An exception to this are the `sort`, `page` and `page_size` params - we always use these in the query string and page state, but the API layer will translate them to `ordering`, `order_by`, `offset` and `limit` where appropriate.

Following these rules will ensure that specific page's state can be bookmarked, shared, and retained after they are reloaded.


## URLs

**Never** hardcode URLs to any paths within automation hub. This makes it very difficult to update the app's routing later on.

Instead use the `formatPath` function to get URLs, with paths from the `Paths` enum.
Both of these are found in `src/paths.tsx`.

Example:

```
// Static route
<Link to={formatPath(Paths.collections)} />

// Dynamic route
<Link to={formatPath(Paths.editNamespace, { namespace: "NSname" })} />

// With ?params
<Link to={formatPath(Paths.myNamespaces, {}, { page: 1 })} />
```

Given a path like `Paths.foo = '/foo/:bar'`, `formatPath(Paths.foo)` will fail because the value of `:bar` was not provided, `formatPath(Paths.foo, { bar: 'abc' })` will yield `<PREFIX>/foo/abc`. `<PREFIX>` is an empty string in standalone/community modes, but in insights mode, it becomes `/ansible/automation-hub`.

The insights mode router uses a basename of `/`, `/beta/`, or `/preview/`, with hub mounted under `ansible/automation-hub`,
while the standalone mode uses a basename of `UI_BASE_PATH` (typically `/ui/`), with hub mounted directly there.

In standalone mode, the router doesn't handle anything outside `/ui/`, and code in `src/entry-standalone.tsx` takes care of redirecting to `/ui/`,
or to `/ui/dispatch/` when the url matches a `/namespace/collection`-like format.

Use `Link to=` with URLs from `formatPath` (relative to router base path), and `ExternalLink href=` for real-word URLs going outside hub.
`ExternalLink` also takes care of setting the right `rel=nofollow`, etc. attributes and adding an external link icon.


## Linters

`npm run lint` runs all the linters, `npm run lint-fix` runs all the linters which can auto-fix things. `npm run lint-setup` tries to install any missing linters.


## Helper tasks

`find-unused-exports`: tries to find dead exports, with some false positives. Needs `npm run imports-to-relative` to work.
`gettext:compile`: convert `locale/*.po` files to JSON, save to `locale/*.json`.
`gettext:extract`: extract all translatable strings from `src/` to `locale/*.po`.
`imports-to-relative`: changes all imports from `src/foo` to `../foo` or `../../foo` etc., depending on depth.
`imports-to-src`: changes all imports from `../foo` or `../../foo` etc. to `src/foo`. Opposite of `imports-to-relative`.
`prettier`: fix prettier issues
`sort-exports`: sort `src/*/index.ts` exports - changes export to import, runs prettier, changes back
