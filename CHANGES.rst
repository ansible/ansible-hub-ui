4.9.2 (2024-05-13)
==================

No significant changes.


----


4.9.1 (2024-01-31)
==================

Misc
----

- `AAH-850 <https://issues.redhat.com/browse/AAH-850>`_


----


4.9.0 (2023-12-07)
==================

Features
--------

- Add Users section to Access tab (Namespaces, Remotes, Repositories, EEs)
  `AAH-2284 <https://issues.redhat.com/browse/AAH-2284>`_
- Add a warning on beta-galaxy about minimum client requirements
  `AAH-2739 <https://issues.redhat.com/browse/AAH-2739>`_
- Roles, role namespaces: use separate filter toolbar from collections, add sorts
  `AAH-2791 <https://issues.redhat.com/browse/AAH-2791>`_


Bugfixes
--------

- community Sync - disable without a requirements file .. on the detail screen
  `AAH-2360 <https://issues.redhat.com/browse/AAH-2360>`_
- Collection upload/deprecate - fix permission checks
  `AAH-2439 <https://issues.redhat.com/browse/AAH-2439>`_,
  `AAH-2853 <https://issues.redhat.com/browse/AAH-2853>`_
- Ensure beta-galaxy users can delete their collections
  `AAH-2632 <https://issues.redhat.com/browse/AAH-2632>`_
- Show namespace name, not company
  `AAH-2722 <https://issues.redhat.com/browse/AAH-2722>`_
- Remote form: warn about signed_only enabled & missing requirements for Galaxy remote
  `AAH-2748 <https://issues.redhat.com/browse/AAH-2748>`_
- Use version property name instead of number.
  `AAH-2807 <https://issues.redhat.com/browse/AAH-2807>`_
- Repository sync - fix "optimize" description
  `AAH-2884 <https://issues.redhat.com/browse/AAH-2884>`_


Misc
----

- `AAH-2289 <https://issues.redhat.com/browse/AAH-2289>`_, `AAH-2626 <https://issues.redhat.com/browse/AAH-2626>`_, `AAH-2652 <https://issues.redhat.com/browse/AAH-2652>`_, `AAH-2697 <https://issues.redhat.com/browse/AAH-2697>`_, `AAH-2708 <https://issues.redhat.com/browse/AAH-2708>`_, `AAH-2726 <https://issues.redhat.com/browse/AAH-2726>`_, `AAH-2730 <https://issues.redhat.com/browse/AAH-2730>`_


----


4.8.1 (2023-10-20)
==================

Bugfixes
--------

- community Sync - disable without a requirements file .. on the detail screen
  `AAH-2360 <https://issues.redhat.com/browse/AAH-2360>`_
- Remote form: warn about signed_only enabled & missing requirements for Galaxy remote
  `AAH-2748 <https://issues.redhat.com/browse/AAH-2748>`_


Misc
----

- `AAH-2726 <https://issues.redhat.com/browse/AAH-2726>`_


----


4.8.0 (2023-09-13)
==================

Features
--------

- Collection documentation: support semantic markup.
  `AAH-2156 <https://issues.redhat.com/browse/AAH-2156>`_
- Add a landing page to our UI.
  `AAH-2172 <https://issues.redhat.com/browse/AAH-2172>`_
- Change Wisdom Modal and legacy namespaces menu, rename to Ansible Lightspeed
  `AAH-2220 <https://issues.redhat.com/browse/AAH-2220>`_
- Expose collection download count in the UI
  `AAH-2237 <https://issues.redhat.com/browse/AAH-2237>`_
- Expose legacy role download count in the UI
  `AAH-2241 <https://issues.redhat.com/browse/AAH-2241>`_
- Enabled community profile in cypress CI
  `AAH-2242 <https://issues.redhat.com/browse/AAH-2242>`_
- Repository tests - detail, list.
  `AAH-2245 <https://issues.redhat.com/browse/AAH-2245>`_
- cypress tests for Approval with multiple repositories
  `AAH-2248 <https://issues.redhat.com/browse/AAH-2248>`_
- add collection upload modal + refactor Approve Modal - extract multiple repo selector and use it both in ApproveModal and UploadModal.
  `AAH-2250 <https://issues.redhat.com/browse/AAH-2250>`_
- Cypress tests for collection upload with multiple repositories.
  `AAH-2251 <https://issues.redhat.com/browse/AAH-2251>`_
- Add copy collection version in collection detail screen
  `AAH-2255 <https://issues.redhat.com/browse/AAH-2255>`_
- Added filter for Approved, Staging and Rejected for Repository list.
  `AAH-2259 <https://issues.redhat.com/browse/AAH-2259>`_
- Delete collection or version from repo only.
  `AAH-2261 <https://issues.redhat.com/browse/AAH-2261>`_
- Repository list - add columns, filters
  `AAH-2271 <https://issues.redhat.com/browse/AAH-2271>`_
- Repository sync - modal to set mirror, optimize
  `AAH-2301 <https://issues.redhat.com/browse/AAH-2301>`_
- Disable checkbox for adding collection if collection is already assigned to repository
  `AAH-2323 <https://issues.redhat.com/browse/AAH-2323>`_
- Ajdust UI messages to reflect synclist deprecation.
  `AAH-2335 <https://issues.redhat.com/browse/AAH-2335>`_


Bugfixes
--------

- Properly display DRF API in browser with CSS
  `AAH-2148 <https://issues.redhat.com/browse/AAH-2148>`_
- Namespace detail: sign all collections only signs current repo now
  `AAH-2308 <https://issues.redhat.com/browse/AAH-2308>`_
- community - fix token page expiration notice when auth provider is github
  `AAH-2324 <https://issues.redhat.com/browse/AAH-2324>`_
- Respect `display_repositories` feature flag for collection/namespace/role filters list.
  `AAH-2326 <https://issues.redhat.com/browse/AAH-2326>`_
- Repositories, Remotes - clean filter text on search
  `AAH-2340 <https://issues.redhat.com/browse/AAH-2340>`_
- Support old galaxy URLs outside of base path, disambiguate
  `AAH-2342 <https://issues.redhat.com/browse/AAH-2342>`_
- Approval dashboard: fix when more than 10 staging repos
  `AAH-2366 <https://issues.redhat.com/browse/AAH-2366>`_
- c.r.c. move alert list so it's not covered by breadcrumbs
  `AAH-2432 <https://issues.redhat.com/browse/AAH-2432>`_
- Fix Namespaces/Partners breadcrumb
  `AAH-2433 <https://issues.redhat.com/browse/AAH-2433>`_
- Removed alert from task view page stating users could only see their tasks.  All authenticated users can list and retrieve task details.
  `AAH-2438 <https://issues.redhat.com/browse/AAH-2438>`_
- Namespace detail: use is_highest consistently
  `AAH-2443 <https://issues.redhat.com/browse/AAH-2443>`_
- Better choice of distribution when multiple per repo
  `AAH-2586 <https://issues.redhat.com/browse/AAH-2586>`_
- Add autocomplete=off to login form fields
  `AAH-2625 <https://issues.redhat.com/browse/AAH-2625>`_
- Fix dispatch page filter param
  `AAH-2670 <https://issues.redhat.com/browse/AAH-2670>`_
- Collection documentation: do not wrongly interpret plugins/modules whose name starts with `_` as deprecated.
  `AAH-3715 <https://issues.redhat.com/browse/AAH-3715>`_


Misc
----

- `AAH-1893 <https://issues.redhat.com/browse/AAH-1893>`_


----


4.7.3 (2023-09-18)
==================

No significant changes.


----


4.7.2 (2023-09-14)
==================

Features
--------

- Expose legacy role download count in the UI
  `AAH-2241 <https://issues.redhat.com/browse/AAH-2241>`_
- Repository tests - detail, list.
  `AAH-2245 <https://issues.redhat.com/browse/AAH-2245>`_
- cypress tests for Approval with multiple repositories
  `AAH-2248 <https://issues.redhat.com/browse/AAH-2248>`_
- add collection upload modal + refactor Approve Modal - extract multiple repo selector and use it both in ApproveModal and UploadModal.
  `AAH-2250 <https://issues.redhat.com/browse/AAH-2250>`_
- Cypress tests for collection upload with multiple repositories.
  `AAH-2251 <https://issues.redhat.com/browse/AAH-2251>`_
- Add copy collection version in collection detail screen
  `AAH-2255 <https://issues.redhat.com/browse/AAH-2255>`_
- Delete collection or version from repo only.
  `AAH-2261 <https://issues.redhat.com/browse/AAH-2261>`_
- Repository list - add columns, filters
  `AAH-2271 <https://issues.redhat.com/browse/AAH-2271>`_
- Repository sync - modal to set mirror, optimize
  `AAH-2301 <https://issues.redhat.com/browse/AAH-2301>`_


Bugfixes
--------

- community - fix token page expiration notice when auth provider is github
  `AAH-2324 <https://issues.redhat.com/browse/AAH-2324>`_
- Repositories, Remotes - clean filter text on search
  `AAH-2340 <https://issues.redhat.com/browse/AAH-2340>`_
- Support old galaxy URLs outside of base path, disambiguate
  `AAH-2342 <https://issues.redhat.com/browse/AAH-2342>`_
- Approval dashboard: fix when more than 10 staging repos
  `AAH-2366 <https://issues.redhat.com/browse/AAH-2366>`_
- Fix Namespaces/Partners breadcrumb
  `AAH-2433 <https://issues.redhat.com/browse/AAH-2433>`_
- Namespace detail: use is_highest consistently
  `AAH-2443 <https://issues.redhat.com/browse/AAH-2443>`_
- Better choice of distribution when multiple per repo
  `AAH-2586 <https://issues.redhat.com/browse/AAH-2586>`_
- Add autocomplete=off to login form fields
  `AAH-2625 <https://issues.redhat.com/browse/AAH-2625>`_
- Fix dispatch page filter param
  `AAH-2670 <https://issues.redhat.com/browse/AAH-2670>`_


----


4.7.1 (2023-05-23)
==================

Features
--------

- Collection documentation: support semantic markup.
  `AAH-2156 <https://issues.redhat.com/browse/AAH-2156>`_
- Change Wisdom Modal and legacy namespaces menu, rename to Ansible Lightspeed
  `AAH-2220 <https://issues.redhat.com/browse/AAH-2220>`_
- Added filter for Approved, Staging and Rejected for Repository list.
  `AAH-2259 <https://issues.redhat.com/browse/AAH-2259>`_
- Disable checkbox for adding collection if collection is already assigned to repository
  `AAH-2323 <https://issues.redhat.com/browse/AAH-2323>`_


Bugfixes
--------

- Fix Edit collection ignoring repository object permissions
  `AAH-2305 <https://issues.redhat.com/browse/AAH-2305>`_
- Namespace detail: sign all collections only signs current repo now
  `AAH-2308 <https://issues.redhat.com/browse/AAH-2308>`_
- Collection documentation: do not wrongly interpret plugins/modules whose name starts with `_` as deprecated.
  `AAH-3715 <https://issues.redhat.com/browse/AAH-3715>`_


----


4.7.0 (2023-04-17)
==================

Features
--------

- Create Issue button in collection detail screen, leading to prefilled access.redhat.com/support/cases
  `AAH-568 <https://issues.redhat.com/browse/AAH-568>`_
- Replaced existing collection search with pulp_ansible collection version search endpoint
  `AAH-767 <https://issues.redhat.com/browse/AAH-767>`_
- Display Ansible Automation Platform version
  `AAH-1315 <https://issues.redhat.com/browse/AAH-1315>`_
- Utilize hasPermission function to accomodate new permission names from the API.
  `AAH-1714 <https://issues.redhat.com/browse/AAH-1714>`_
- Removed inbound repository logic and updated collection upload with ``v3/artifacts/collections/`` endpoint
  `AAH-1778 <https://issues.redhat.com/browse/AAH-1778>`_
- Display boolean values in docs as true/false (was yes/no)
  `AAH-1859 <https://issues.redhat.com/browse/AAH-1859>`_
- Automerge of dependabots PRs.
  `AAH-1959 <https://issues.redhat.com/browse/AAH-1959>`_
- Add ability to retry the failed cypress tests.
  `AAH-1964 <https://issues.redhat.com/browse/AAH-1964>`_
- CRUD UI for collection repositories
  `AAH-1998 <https://issues.redhat.com/browse/AAH-1998>`_
- CRUD UI for collection remotes
  `AAH-1999 <https://issues.redhat.com/browse/AAH-1999>`_
- Add menu test for insights mode.
  `AAH-2011 <https://issues.redhat.com/browse/AAH-2011>`_
- Use permissions from API rather than the from the constants file.
  `AAH-2016 <https://issues.redhat.com/browse/AAH-2016>`_
- In the "Connect to Hub" tab UI in PAH, add a link to the CRC public key so customers can easily find and access the key for signed collections. https://access.redhat.com/security/team/key
  `AAH-2025 <https://issues.redhat.com/browse/AAH-2025>`_
- Finish the auromerge of dependabots PRs.
  `AAH-2053 <https://issues.redhat.com/browse/AAH-2053>`_
- Adjust tests to also support insights mode. Added collections tests.
  `AAH-2054 <https://issues.redhat.com/browse/AAH-2054>`_
- Wisdom modal for opt in/opt out operation in namespaces and legacy namespaces.
  `AAH-2096 <https://issues.redhat.com/browse/AAH-2096>`_
- [community] Terms of Use link
  `AAH-2159 <https://issues.redhat.com/browse/AAH-2159>`_
- Modal for manual approval to multiple repositories with selectors + rejection for multiple repositories.
  `AAH-2169 <https://issues.redhat.com/browse/AAH-2169>`_


Bugfixes
--------

- Added search ahead in namespace selection in imports.
  `AAH-1725 <https://issues.redhat.com/browse/AAH-1725>`_
- Repair list of collection dependencies - add namespace to the link caption.
  `AAH-1807 <https://issues.redhat.com/browse/AAH-1807>`_
- Repair error mesages in EE form.
  `AAH-1845 <https://issues.redhat.com/browse/AAH-1845>`_
- Fix filtering by repository and update paths for namespace detail
  `AAH-1945 <https://issues.redhat.com/browse/AAH-1945>`_
- Collection dependencies - link has to check also collection version
  `AAH-1972 <https://issues.redhat.com/browse/AAH-1972>`_
- Ensure trailing slash in collection dependencies urls
  `AAH-1973 <https://issues.redhat.com/browse/AAH-1973>`_
- Fix podman pull URLs when latest tag not present, fix digest urls
  `AAH-1988 <https://issues.redhat.com/browse/AAH-1988>`_
- insights: use UI_BASE_PATH over computing basename from pathname
  `AAH-1990 <https://issues.redhat.com/browse/AAH-1990>`_
- Show container signing button based only on container_signing, not collection_signing
  `AAH-2013 <https://issues.redhat.com/browse/AAH-2013>`_
- Show container signature badge based only on container_signing, not collection_signing
  `AAH-2015 <https://issues.redhat.com/browse/AAH-2015>`_
- Fix a bug where the UI was falsely reporting that collection dependencies don't exist.
  `AAH-2018 <https://issues.redhat.com/browse/AAH-2018>`_
- UI to upload requirements file
  `AAH-2044 <https://issues.redhat.com/browse/AAH-2044>`_
- License fields on AH - blank or formatted incorrectly - Add comma separator between licences. And also hide license field when empty.
  `AAH-2048 <https://issues.redhat.com/browse/AAH-2048>`_
- Fix bug where the resource type on "reserved resources" on the task management page always returns "api".
  `AAH-2055 <https://issues.redhat.com/browse/AAH-2055>`_
- [beta] UX: slow legacy pagination needs loading spinners.
  `AAH-2062 <https://issues.redhat.com/browse/AAH-2062>`_
- [beta] UX: give a helpful message about roles with no versions.
  `AAH-2063 <https://issues.redhat.com/browse/AAH-2063>`_
- CRC Hub has broken link to SSO offline token page. Fixed URL from: https://sso.redhat.com/auth/realms/redhat-external/account/applications to: https://sso.redhat.com/auth/realms/redhat-external/account.
  `AAH-2069 <https://issues.redhat.com/browse/AAH-2069>`_
- Menu in insights does not load and render.
  `AAH-2073 <https://issues.redhat.com/browse/AAH-2073>`_
- Fix and unify collection detail routing to `/ui/repo/<repository>/<namespace>/<collection>`
  `AAH-2231 <https://issues.redhat.com/browse/AAH-2231>`_
- RepoSelector: make it clear the selector is read only now
  `AAH-2232 <https://issues.redhat.com/browse/AAH-2232>`_
- Don't send my_permissions field when repository/remote is edited (fixes a 400 Bad request)
  `AAH-2233 <https://issues.redhat.com/browse/AAH-2233>`_
- Creating a distribution - transform base_path, rename on failure
  `AAH-2253 <https://issues.redhat.com/browse/AAH-2253>`_,
  `AAH-2277 <https://issues.redhat.com/browse/AAH-2277>`_
- Delete repository distributions when deleting a repository
  `AAH-2254 <https://issues.redhat.com/browse/AAH-2254>`_,
  `AAH-2278 <https://issues.redhat.com/browse/AAH-2278>`_
- Repair approve modal checkbox - select/deselect.
  `AAH-2263 <https://issues.redhat.com/browse/AAH-2263>`_
- Fix Delete collection version redirect when in multiple repos
  `AAH-2264 <https://issues.redhat.com/browse/AAH-2264>`_
- Unlock logo size in collection list
  `AAH-2272 <https://issues.redhat.com/browse/AAH-2272>`_
- Hide `hide_from_search` repositories in repository filter
  `AAH-2273 <https://issues.redhat.com/browse/AAH-2273>`_
- Remove from repo button says Remove, not Delete now
  `AAH-2275 <https://issues.redhat.com/browse/AAH-2275>`_
- Fixed user permissions for uploading collections
  `AAH-2276 <https://issues.redhat.com/browse/AAH-2276>`_
- Show NotFound instead of spinner for nonexistent Repository/Remote detail
  `AAH-2282 <https://issues.redhat.com/browse/AAH-2282>`_
- fix extra "You don't have permission to display users." when deleting groups
  `AAH-2283 <https://issues.redhat.com/browse/AAH-2283>`_
- Details: break words when needed for wrapping
  `AAH-2285 <https://issues.redhat.com/browse/AAH-2285>`_
- Use mirror:true for repository syncs
  `AAH-2286 <https://issues.redhat.com/browse/AAH-2286>`_
- Hide repository modal if deletion fails and disable delete button if repository is protected
  `AAH-2300 <https://issues.redhat.com/browse/AAH-2300>`_
- Restyle collection list item controls to keep alignment despite varying repository name lengths
  `AAH-2303 <https://issues.redhat.com/browse/AAH-2303>`_
- Fix EmptyStateFilter not appearing in Namespace detail when filtering by repo
  `AAH-2304 <https://issues.redhat.com/browse/AAH-2304>`_
- Fix Add/Remove collection ignoring repository object permissions
  `AAH-2305 <https://issues.redhat.com/browse/AAH-2305>`_


Misc
----

- `AAH-1271 <https://issues.redhat.com/browse/AAH-1271>`_, `AAH-1721 <https://issues.redhat.com/browse/AAH-1721>`_, `AAH-2274 <https://issues.redhat.com/browse/AAH-2274>`_


----
