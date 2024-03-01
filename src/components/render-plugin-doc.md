### RenderPluginDoc

Renders the documentation strings from a plugin.

Props

- `plugin`: documentation blob for plugin being rendered. This is produced by the galaxy-importer.
- `renderModuleLink(moduleName)`: function that should return a link pointing to a module
- `renderDocLink(name, href)`: function that should return a link pointing to docs
- `renderTableOfContentsLink(title, section)`: function that returns a table of contents link for scrolling the page down to the various headers.
- `renderWarning(text)`: function that returns a warning banner when something breaks during rendering.
